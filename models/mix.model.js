// Postgres-backed Book model with in-memory fallback + relations with Mongo profiles
const { Pool } = require('pg');
require('dotenv').config();
const mongoose = require('mongoose');

const connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL;
let pool = null;
if (connectionString) {
    pool = new Pool({ connectionString });
}

// Optional: connect mongoose here if a MONGO_URI is provided and not already connected
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri && mongoose.connection.readyState === 0) {
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch(err => {
        // Log, but don't crash the module initialization
        console.error('Mongoose connection error:', err);
    });
}

const { Schema } = mongoose;

const ProfileSchema = new Schema({
    _id: { type: Number, required: true }, // use Postgres user id as profile id
    preferences: { type: Schema.Types.Mixed, default: {} },
    history: { type: [Schema.Types.Mixed], default: [] },
    createdAt: { type: Date, default: Date.now },
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

async function getUserById(userId) {
    if (!pool) return null;
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows[0] || null;
}

async function getProfileById(profileId) {
    return Profile.findById(Number(profileId)).lean();
}

// Returns combined object { user, profile }
async function getUserWithProfile(userId) {
    const [user, profile] = await Promise.all([
        getUserById(userId),
        getProfileById(userId),
    ]);
    return { user, profile };
}

// Create profile for a user id if not exists
async function createProfileForUser(userId, data = {}) {
    const id = Number(userId);
    let profile = await Profile.findById(id);
    if (profile) return profile;
    profile = new Profile(Object.assign({ _id: id }, data));
    return profile.save();
}

// Link a profile to a user: ensure Postgres user exists, then create profile
async function linkProfileToUser(userId, profileData = {}) {
    const user = await getUserById(userId);
    if (!user) throw new Error(`Postgres user ${userId} not found`);
    return createProfileForUser(userId, profileData);
}

module.exports = {
    pool,
    Profile,
    getUserById,
    getProfileById,
    getUserWithProfile,
    createProfileForUser,
    linkProfileToUser,
};
