const mixModel = require('../models/mix.model');

const getUserFullById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'id is required' });
    const asNumber = Number(id);
    if (isNaN(asNumber) || !Number.isInteger(asNumber)) {
      return res.status(400).json({ message: 'id must be an integer' });
    }

    const result = await mixModel.getUserWithProfile(asNumber);
    if (!result || (!result.user && !result.profile)) {
      return res.status(404).json({ message: 'No user or profile found for this id' });
    }

    return res.json({ user: result.user || null, profile: result.profile || null });
  } catch (err) {
    console.error('mixController.getUserFullById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserFullById,
};
