const mongoose = require('mongoose');
const RecyclingSubmission = require('../models/RecyclingSubmission');
const RecyclingPoint = require('../models/RecyclingPoint');
const { awardCredits } = require('../services/creditService');

const { DEVICE_CATEGORIES } = RecyclingPoint;
const STATUSES = ['pending', 'confirmed', 'rejected', 'cancelled'];
const MAX_WEIGHT_KG = 10000;
const MAX_QUANTITY = 1000;

const formatSubmission = (item) => ({
  _id: item._id,
  status: item.status,
  deviceType: item.deviceType,
  deviceName: item.deviceName,
  quantity: item.quantity,
  weightKg: item.weightKg,
  notes: item.notes,
  creditsAwarded: item.creditsAwarded,
  rejectionReason: item.rejectionReason,
  createdAt: item.createdAt,
  reviewedAt: item.reviewedAt,
  recyclingPoint:
    item.recyclingPoint && item.recyclingPoint.name
      ? {
          _id: item.recyclingPoint._id,
          name: item.recyclingPoint.name,
          address: item.recyclingPoint.address,
          area: item.recyclingPoint.area,
        }
      : item.recyclingPoint,
  user:
    item.user && item.user.name
      ? { _id: item.user._id, name: item.user.name, email: item.user.email }
      : undefined,
});

// @route   POST /api/submissions
// @access  Private (user)
// FR7: recycle korte chaowa e-waste er tothyo jama deowa
const createSubmission = async (req, res) => {
  try {
    const { recyclingPointId, deviceType, deviceName, quantity, weightKg, notes } =
      req.body;

    if (!mongoose.isValidObjectId(recyclingPointId)) {
      return res.status(400).json({ message: 'Please select a recycling point' });
    }

    if (!DEVICE_CATEGORIES.includes(deviceType)) {
      return res.status(400).json({ message: 'Please select a valid device type' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
      return res
        .status(400)
        .json({ message: 'Quantity must be a whole number of 1 or more' });
    }

    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0 || weight > MAX_WEIGHT_KG) {
      return res
        .status(400)
        .json({ message: 'Weight must be a number greater than 0' });
    }

    if (notes && String(notes).length > 300) {
      return res
        .status(400)
        .json({ message: 'Notes must be 300 characters or less' });
    }

    const point = await RecyclingPoint.findById(recyclingPointId);
    if (!point) {
      return res.status(404).json({ message: 'Recycling point not found' });
    }

    if (point.status !== 'open') {
      return res
        .status(400)
        .json({ message: `${point.name} is currently ${point.status}` });
    }

    if (!point.acceptedTypes.includes(deviceType)) {
      return res
        .status(400)
        .json({ message: `${point.name} does not accept ${deviceType}` });
    }

    const submission = await RecyclingSubmission.create({
      user: req.user._id,
      recyclingPoint: point._id,
      deviceType,
      deviceName,
      quantity: qty,
      weightKg: weight,
      notes,
    });

    await submission.populate('recyclingPoint', 'name address area');

    res.status(201).json(formatSubmission(submission));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/submissions/mine
// @access  Private
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await RecyclingSubmission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('recyclingPoint', 'name address area');

    res.json({
      count: submissions.length,
      submissions: submissions.map(formatSubmission),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/submissions/:id/cancel
// @access  Private (owner)
const cancelSubmission = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await RecyclingSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (String(submission.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only cancel your own submissions' });
    }

    if (submission.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Only pending submissions can be cancelled' });
    }

    submission.status = 'cancelled';
    await submission.save();

    res.json(formatSubmission(submission));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/submissions?status=pending
// @access  Private (partner, admin)
const getAllSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      filter.status = status;
    }

    const submissions = await RecyclingSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('recyclingPoint', 'name address area')
      .populate('user', 'name email');

    res.json({
      count: submissions.length,
      submissions: submissions.map(formatSubmission),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/submissions/:id/confirm
// @access  Private (partner, admin)
// E-waste peye gele confirm kora hoy, tokhon FR8 er credit user ke jay
const confirmSubmission = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await RecyclingSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Only pending submissions can be confirmed' });
    }

    const result = await awardCredits(submission.user, submission.weightKg, {
      submissionId: submission._id,
      description: `Recycling submission: ${submission.quantity} x ${submission.deviceType}`,
    });

    submission.status = 'confirmed';
    submission.creditsAwarded = result.transaction.credits;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.json({
      message: 'Submission confirmed and Green Credits awarded',
      submission: formatSubmission(submission),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PATCH /api/submissions/:id/reject
// @access  Private (partner, admin)
const rejectSubmission = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await RecyclingSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Only pending submissions can be rejected' });
    }

    submission.status = 'rejected';
    submission.rejectionReason = req.body?.reason;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.json(formatSubmission(submission));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  cancelSubmission,
  getAllSubmissions,
  confirmSubmission,
  rejectSubmission,
};