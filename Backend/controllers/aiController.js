const Device = require('../models/Device');

const CATEGORIES = [
  'smartphone',
  'laptop',
  'tablet',
  'television',
  'desktop',
  'monitor',
  'battery',
  'charger',
  'other',
];

const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');

const scoreDevice = (device, query) => {
  const candidates = [
    device.name,
    `${device.brand} ${device.name}`,
    device.model,
    ...device.aliases,
  ].map(normalize);

  let best = 0;

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === query) return 100;

    if (candidate.includes(query) || query.includes(candidate)) {
      const ratio =
        Math.min(candidate.length, query.length) /
        Math.max(candidate.length, query.length);
      best = Math.max(best, Math.round(ratio * 90));
    }
  }

  return best;
};

const buildPrompt = (query, hasImage) => `
You are an e-waste identification assistant.
${hasImage ? 'Look at the attached image.' : ''}
${query ? `The user typed this device name or model: "${query}".` : ''}

Identify the electronic device. If you do not know the exact model, still give the most likely general device category.
If the input is not an electronic device, set "identified" to false.

Reply with ONLY a JSON object in this exact format, with no other text:
{
  "identified": true or false,
  "name": "device name or empty string",
  "brand": "brand or empty string",
  "model": "model or empty string",
  "category": one of ${JSON.stringify(CATEGORIES)},
  "confidence": number from 0 to 100,
  "estimatedWeightKg": number (typical weight of this kind of device in kg),
  "reasoning": "one short sentence"
}`;

const callGemini = async (query, imageBase64, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in .env');
  }

  const parts = [{ text: buildPrompt(query, Boolean(imageBase64)) }];

  if (imageBase64) {
    parts.push({
      inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 },
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API request failed');
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  if (!text) {
    throw new Error('AI returned an empty response');
  }

  return JSON.parse(text);
};

// @route   POST /api/devices/ai-identify
// @access  Private
// FR1 (image) + FR2 (unknown device recognition)
const aiIdentify = async (req, res) => {
  try {
    const { query, imageBase64, mimeType } = req.body;

    if ((!query || !query.trim()) && !imageBase64) {
      return res
        .status(400)
        .json({ message: 'Enter a device name or upload an image' });
    }

    const ai = await callGemini(query?.trim(), imageBase64, mimeType);

    if (!ai.identified) {
      return res.json({
        identified: false,
        message: 'Could not recognize an electronic device from this input',
      });
    }

    if (!CATEGORIES.includes(ai.category)) {
      ai.category = 'other';
    }

    const estimatedWeightKg =
      Number(ai.estimatedWeightKg) > 0 ? Number(ai.estimatedWeightKg) : null;

    // AI er naam database er device er sathe mile kina
    const devices = await Device.find();
    const aiQuery = normalize(`${ai.brand || ''} ${ai.name || ''}`);

    let matchedDevice = null;
    if (aiQuery) {
      const best = devices
        .map((device) => ({
          device,
          confidence: scoreDevice(device, aiQuery),
        }))
        .sort((a, b) => b.confidence - a.confidence)[0];

      if (best && best.confidence >= 60) {
        matchedDevice = {
          _id: best.device._id,
          name: best.device.name,
          brand: best.device.brand,
          model: best.device.model,
          category: best.device.category,
          weightKg: best.device.weightKg,
        };
      }
    }

    // Database e na thakle, same category er ekta device ke "typical" dhore nebo
    let typicalDevice = null;
    if (!matchedDevice) {
      const found = await Device.findOne({ category: ai.category });
      if (found) {
        typicalDevice = {
          _id: found._id,
          name: found.name,
          brand: found.brand,
          category: found.category,
          weightKg: found.weightKg,
        };
      }
    }

    res.json({
      identified: true,
      inDatabase: Boolean(matchedDevice),
      ai: {
        name: ai.name,
        brand: ai.brand,
        model: ai.model,
        category: ai.category,
        confidence: Math.round(Number(ai.confidence) || 0),
        estimatedWeightKg,
        reasoning: ai.reasoning,
      },
      matchedDevice,
      typicalDevice,
    });
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};

module.exports = { aiIdentify };