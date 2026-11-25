<<<<<<< HEAD
const mongoose = require('mongoose');
const RecyclingPoint = require('../models/RecyclingPoint');

const { DEVICE_CATEGORIES } = RecyclingPoint;
const STATUSES = ['open', 'closed', 'temporarily closed'];

const formatPoint = (point) => ({
  _id: point._id,
  name: point.name,
  address: point.address,
  area: point.area,
  status: point.status,
  openingHours: point.openingHours,
  acceptedTypes: point.acceptedTypes,
  coordinates: {
    lng: point.location.coordinates[0],
    lat: point.location.coordinates[1],
  },
});

// @route   GET /api/recycling-points/nearby?lat=..&lng=..&maxKm=..&type=..
// @access  Private
// FR5: user er location theke kache thaka recycling point, distance onujayi
const getNearbyPoints = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const maxKm = req.query.maxKm ? parseFloat(req.query.maxKm) : 25;
    const { type } = req.query;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res
        .status(400)
        .json({ message: 'Valid latitude and longitude are required' });
    }

    if (!Number.isFinite(maxKm) || maxKm <= 0 || maxKm > 200) {
      return res
        .status(400)
        .json({ message: 'Distance must be between 1 and 200 km' });
    }

    if (type && !DEVICE_CATEGORIES.includes(type)) {
      return res.status(400).json({ message: 'Invalid e-waste type' });
    }

    const geoNear = {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distanceMeters',
      maxDistance: maxKm * 1000,
      spherical: true,
    };

    if (type) {
      geoNear.query = { acceptedTypes: type };
    }

    // $geoNear nijei shobcheye kache thakata age rakhe sort kore
    const points = await RecyclingPoint.aggregate([
      { $geoNear: geoNear },
      { $limit: 50 },
    ]);

    res.json({
      count: points.length,
      searchedFrom: { lat, lng },
      maxKm,
      points: points.map((point) => ({
        ...formatPoint(point),
        distanceKm: Number((point.distanceMeters / 1000).toFixed(2)),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/recycling-points?type=..&status=..&area=..
// @access  Private
// FR6: shob recycling point er tothyo (filter shoho)
const getAllPoints = async (req, res) => {
  try {
    const { type, status, area } = req.query;
    const filter = {};

    if (type) {
      if (!DEVICE_CATEGORIES.includes(type)) {
        return res.status(400).json({ message: 'Invalid e-waste type' });
      }
      filter.acceptedTypes = type;
    }

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      filter.status = status;
    }

    if (area) {
      filter.area = area;
    }

    const points = await RecyclingPoint.find(filter).sort({ name: 1 });

    res.json({
      count: points.length,
      points: points.map(formatPoint),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/recycling-points/:id
// @access  Private
// FR6: ekta recycling point er puro tothyo
const getPointById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid recycling point id' });
    }

    const point = await RecyclingPoint.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Recycling point not found' });
    }

    res.json(formatPoint(point));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

=======
const mongoose = require('mongoose');
const RecyclingPoint = require('../models/RecyclingPoint');

const { DEVICE_CATEGORIES } = RecyclingPoint;
const STATUSES = ['open', 'closed', 'temporarily closed'];

const formatPoint = (point) => ({
  _id: point._id,
  name: point.name,
  address: point.address,
  area: point.area,
  status: point.status,
  openingHours: point.openingHours,
  acceptedTypes: point.acceptedTypes,
  coordinates: {
    lng: point.location.coordinates[0],
    lat: point.location.coordinates[1],
  },
});

// @route   GET /api/recycling-points/nearby?lat=..&lng=..&maxKm=..&type=..
// @access  Private
// FR5: user er location theke kache thaka recycling point, distance onujayi
const getNearbyPoints = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const maxKm = req.query.maxKm ? parseFloat(req.query.maxKm) : 25;
    const { type } = req.query;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res
        .status(400)
        .json({ message: 'Valid latitude and longitude are required' });
    }

    if (!Number.isFinite(maxKm) || maxKm <= 0 || maxKm > 200) {
      return res
        .status(400)
        .json({ message: 'Distance must be between 1 and 200 km' });
    }

    if (type && !DEVICE_CATEGORIES.includes(type)) {
      return res.status(400).json({ message: 'Invalid e-waste type' });
    }

    const geoNear = {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distanceMeters',
      maxDistance: maxKm * 1000,
      spherical: true,
    };

    if (type) {
      geoNear.query = { acceptedTypes: type };
    }

    // $geoNear nijei shobcheye kache thakata age rakhe sort kore
    const points = await RecyclingPoint.aggregate([
      { $geoNear: geoNear },
      { $limit: 50 },
    ]);

    res.json({
      count: points.length,
      searchedFrom: { lat, lng },
      maxKm,
      points: points.map((point) => ({
        ...formatPoint(point),
        distanceKm: Number((point.distanceMeters / 1000).toFixed(2)),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/recycling-points?type=..&status=..&area=..
// @access  Private
// FR6: shob recycling point er tothyo (filter shoho)
const getAllPoints = async (req, res) => {
  try {
    const { type, status, area } = req.query;
    const filter = {};

    if (type) {
      if (!DEVICE_CATEGORIES.includes(type)) {
        return res.status(400).json({ message: 'Invalid e-waste type' });
      }
      filter.acceptedTypes = type;
    }

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      filter.status = status;
    }

    if (area) {
      filter.area = area;
    }

    const points = await RecyclingPoint.find(filter).sort({ name: 1 });

    res.json({
      count: points.length,
      points: points.map(formatPoint),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/recycling-points/:id
// @access  Private
// FR6: ekta recycling point er puro tothyo
const getPointById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid recycling point id' });
    }

    const point = await RecyclingPoint.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Recycling point not found' });
    }

    res.json(formatPoint(point));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

>>>>>>> fb1fdd0fd48fb222ac2d7cf5dabd1b94bf7b09da
module.exports = { getNearbyPoints, getAllPoints, getPointById };
