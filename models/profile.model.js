const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileSchema = new Schema({
	_id: { type: Number, required: true },
	preferences: { type: Schema.Types.Mixed, default: {} },
	history: { type: [Schema.Types.Mixed], default: [] },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

