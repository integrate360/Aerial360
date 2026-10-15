
import express from "express";
import { checkAppVersion, upsertAppVersion, getAllAppVersions } from "../controllers/appVersionController.js";

const router = express.Router();

// Admin – create/update version config
router.post("/app-version", upsertAppVersion);

// Mobile App – check version
router.get("/app-version/check", checkAppVersion);

router.get("/getAllAppVersions", getAllAppVersions);

export default router;
