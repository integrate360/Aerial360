
import AppVersion from "../models/appVersionModel.js";
import semver from "semver";

const upsertAppVersion = async (req, res) => {
    try {
        const data = req.body;

        const appVersion = await AppVersion.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "App version settings saved successfully",
            data: appVersion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to save app version settings",
            error: error.message,
        });
    }
};

const checkAppVersion = async (req, res) => {
  try {
    const { platform, version, buildVersion } = req.query;
    console.log("🔍 Checking app version:",     
        { platform, version, buildVersion }
    );

    if (!platform || !version) {
      return res.status(400).json({
        success: false,
        message: "platform and version are required",
      });
    }

    const appVersion = await AppVersion.findOne();
    if (!appVersion) {
      return res.status(404).json({
        success: false,
        message: "Version configuration not found",
      });
    }

    const platformData = appVersion[platform];
    if (!platformData) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform",
      });
    }

    // ✅ COERCE versions
    const clientVersion = semver.coerce(version);
    const minimumVersion = semver.coerce(platformData.minimumVersion);

    if (!clientVersion || !minimumVersion) {
      return res.status(400).json({
        success: false,
        message: "Invalid version format",
      });
    }

    const versionForce =
      semver.lt(clientVersion, minimumVersion);

    const buildForce =
      buildVersion &&
      Number(buildVersion) < Number(platformData.buildVersion);

    const isForceUpdate =
      platformData.forceUpdate && (versionForce || buildForce);

    console.log("⚠️ Force Update Result:", {
      clientVersion: clientVersion.version,
      minimumVersion: minimumVersion.version,
      versionForce,
      buildForce,
      isForceUpdate,
    });

    res.status(200).json({
      success: true,
      forceUpdate: isForceUpdate,
      latestVersion: platformData.latestVersion,
      minimumVersion: platformData.minimumVersion,
      buildVersion: platformData.buildVersion,
      updateUrl: platformData.updateUrl,
      message: platformData.message,
    });
  } catch (error) {
    console.error("🔥 Error in checkAppVersion:", error);
    res.status(500).json({
      success: false,
      message: "Version check failed",
    });
  }
};

const getAllAppVersions = async (req, res) => {
  try {
    const appVersions = await AppVersion.find(); 
    res.status(200).json({ success: true, data: appVersions });
  } catch (error) {
    console.error("🔥 Error in getAllAppVersions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export {
    upsertAppVersion,
    checkAppVersion,
    getAllAppVersions,
};