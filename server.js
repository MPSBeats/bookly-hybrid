require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import models to access Postgres pool for a quick connectivity test
const UserModel = require('./models/user.model');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.VITE_API_URL || '*';

app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN }));

// Mount existing route files (they import their controllers internally)
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mixRoutes = require('./routes/mixRoutes');
const mixController = require('./controllers/mixController');

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/mix', mixRoutes);

app.get('/', (req, res) => res.send('Bookly-hybrid API'));

// Backwards-compatible single route so clients calling /api/user-full/:id keep working
app.get('/api/user-full/:id', mixController.getUserFullById);

// Health endpoint that checks basic DB connectivity
app.get('/health', async (req, res) => {
  const health = { uptime: process.uptime() };

  // Check Postgres if the model exposes a pool, otherwise detect in-memory model
  try {
    if (UserModel && UserModel._pool) {
      const { rows } = await UserModel._pool.query('SELECT NOW()');
      health.postgres = { ok: true, now: rows[0].now };
    } else if (UserModel && typeof UserModel.findAll === 'function') {
      // In-memory model present
      try {
        const count = UserModel.findAll().length;
        health.postgres = { ok: 'in-memory', count };
      } catch (e) {
        health.postgres = { ok: false, reason: 'in-memory model error', error: e.message };
      }
    } else {
      health.postgres = { ok: false, reason: 'no postgres pool or in-memory model available' };
    }
  } catch (err) {
    health.postgres = { ok: false, reason: err.message };
  }

  // Check Mongo via mongoose connection
  try {
    health.mongo = { connected: mongoose.connection.readyState === 1 };
  } catch (err) {
    health.mongo = { connected: false, reason: err.message };
  }

  res.json(health);
});

async function start() {
  // Connect to MongoDB if MONGO_URI set
  const MONGO_URI = process.env.MONGO_URI;
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  } else {
    console.warn('MONGO_URI not set — profiles endpoints will fail until configured.');
  }

  // Quick Postgres connectivity check (only works if models expose a pool as `_pool`)
  try {
    if (UserModel && UserModel._pool) {
      const { rows } = await UserModel._pool.query('SELECT NOW()');
      console.log('Postgres connecté:', rows[0].now);
    } else if (UserModel && typeof UserModel.findAll === 'function') {
      // project currently uses in-memory models
      console.log('Pas de connexion Postgres détectée : le modèle utilisateur est en mémoire (pas de pool)._');
    } else {
      console.log('Pas de connexion Postgres détectée : aucun modèle Postgres disponible.');
    }
  } catch (err) {
    console.error('Erreur connexion Postgres:', err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

