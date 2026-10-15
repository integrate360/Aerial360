
const express = require("express");
const {checkAppVersion,upsertAppVersion,getAllAppVersions } = require("../controller/appVersionController.js");

const router = express.Router();

// Admin – create/update version config
router.post("/app-version", upsertAppVersion);

// Mobile App – check version
router.get("/app-version/check", checkAppVersion);

router.get("/getAllAppVersions", getAllAppVersions);


module.exports = router;
