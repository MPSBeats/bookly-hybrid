const Profile = require('../models/profile.model');
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createProfile = async (req, res) => {
	try {
		const data = req.body || {};
		const userId = data.userId !== undefined ? Number(data.userId) : undefined;
		if (!userId || !Number.isInteger(userId)) {
			return res.status(400).json({ message: 'userId (Postgres user id) is required and must be an integer' });
		}

		// Verify user exists in Postgres
		try {
			const pgUser = await User.findById(userId);
			if (!pgUser) return res.status(404).json({ message: 'User not found in Postgres' });
		} catch (e) {
			console.error('Error checking Postgres user:', e);
			return res.status(500).json({ message: 'Error verifying Postgres user' });
		}

		const existing = await Profile.findById(userId);
		if (existing) return res.status(409).json({ message: 'Profile already exists for this user' });

		// Accepts preferences and history. Use _id equal to Postgres user id.
		const payload = {
			_id: userId,
			preferences: data.preferences || {},
			history: Array.isArray(data.history) ? data.history : []
		};
		const profile = new Profile(payload);
		await profile.save();
		return res.status(201).json(profile);
	} catch (err) {
		console.error('createProfile error', err);
		if (err && err.code === 11000) return res.status(409).json({ message: 'Profile already exists for this user' });
		return res.status(500).json({ message: 'Server error' });
	}
};

const getProfiles = async (req, res) => {
	try {
		const profiles = await Profile.find().lean();
		return res.json(profiles);
	} catch (err) {
		console.error('getProfiles error', err);
		return res.status(500).json({ message: 'Server error' });
	}
};

const getProfileById = async (req, res) => {
	try {
		const { id } = req.params;
		const asNumber = Number(id);
		let profile = null;
		if (!isNaN(asNumber) && Number.isInteger(asNumber)) {
			profile = await Profile.findById(asNumber).lean();
		} else if (mongoose.Types.ObjectId.isValid(id)) {
			profile = await Profile.findById(id).lean();
		} else {
			return res.status(400).json({ message: 'Invalid id' });
		}

		if (!profile) return res.status(404).json({ message: 'Profile not found' });
		return res.json(profile);
	} catch (err) {
		console.error('getProfileById error', err);
		return res.status(500).json({ message: 'Server error' });
	}
};

const getProfileByUserId = async (req, res) => {
	try {
		const userId = req.params.userId ? Number(req.params.userId) : undefined;
		if (!userId || !Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid userId' });
		const profile = await Profile.findById(userId).lean();
		if (!profile) return res.status(404).json({ message: 'Profile not found for this user' });
		return res.json(profile);
	} catch (err) {
		console.error('getProfileByUserId error', err);
		return res.status(500).json({ message: 'Server error' });
	}
};

const updateProfile = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body || {};
		const payload = {};
		if (updates.preferences !== undefined) payload.preferences = updates.preferences;
		if (updates.history !== undefined) payload.history = Array.isArray(updates.history) ? updates.history : updates.history ? [updates.history] : [];

		const asNumber = Number(id);
		let profile = null;
		if (!isNaN(asNumber) && Number.isInteger(asNumber)) {
			profile = await Profile.findByIdAndUpdate(asNumber, payload, { new: true }).lean();
		} else if (mongoose.Types.ObjectId.isValid(id)) {
			profile = await Profile.findByIdAndUpdate(id, payload, { new: true }).lean();
		} else {
			return res.status(400).json({ message: 'Invalid id' });
		}

		if (!profile) return res.status(404).json({ message: 'Profile not found' });
		return res.json(profile);
	} catch (err) {
		console.error('updateProfile error', err);
		return res.status(500).json({ message: 'Server error' });
	}
};

const deleteProfile = async (req, res) => {
	try {
		const { id } = req.params;
		const asNumber = Number(id);
		let profile = null;
		if (!isNaN(asNumber) && Number.isInteger(asNumber)) {
			profile = await Profile.findByIdAndDelete(asNumber).lean();
		} else if (mongoose.Types.ObjectId.isValid(id)) {
			profile = await Profile.findByIdAndDelete(id).lean();
		} else {
			return res.status(400).json({ message: 'Invalid id' });
		}

		if (!profile) return res.status(404).json({ message: 'Profile not found' });
		return res.json({ message: 'Profile deleted' });
	} catch (err) {
		console.error('deleteProfile error', err);
		return res.status(500).json({ message: 'Server error' });
	}
    
};

module.exports = {
	createProfile,
	getProfiles,
	getProfileById,
	getProfileByUserId,
	updateProfile,
	deleteProfile,
};


