const router = require('express').Router();
const ctrl = require('../controllers/mixController');

// Return combined { user, profile } for a given Postgres user id
router.get('/user-full/:id', ctrl.getUserFullById);

module.exports = router;