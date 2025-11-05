const router = require("express").Router();
const ctrl = require("../controllers/profileController");

router.get("/", ctrl.getProfiles);
router.get('/user/:userId', ctrl.getProfileByUserId);
router.get("/:id", ctrl.getProfileById);
router.post("/", ctrl.createProfile);
router.put("/:id", ctrl.updateProfile);
router.delete("/:id", ctrl.deleteProfile);

module.exports = router;

