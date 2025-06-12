// filepath: backend/src/controllers/waterDataController.js
const fetch = require('node-fetch');
exports.getWaterData = async (req, res, next) => {
  const { cql } = req.query;
  const url = `https://www.openwaterdata.com/ws/get?token=${process.env.OPENWATER_API_KEY}&cql=${encodeURIComponent(cql)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
};