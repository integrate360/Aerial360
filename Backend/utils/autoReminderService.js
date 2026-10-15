const cron = require("node-cron");
const UserPackagesM = require("../model/UserPackagesM");
const User = require("../model/UserM");
const admin = require("../config/firebaseConfig");
const sentReminders = new Set();

function startAutoReminder() {
  cron.schedule("0 9 * * *", () => {
    checkForExpiredPackages();
    checkForThreeSessionsLeft();
  });
  // checkForExpiredPackages();
  // checkForThreeSessionsLeft();
}

// Check all user packages for users with exactly 3 sessions left
async function checkForThreeSessionsLeft() {
  try {
    const activeUserPackages = await UserPackagesM.find({
      slots: { $gt: 0 },
      paymentStatus: "paid",
    })
      .populate("user")
      .populate("package");

    for (const userPackage of activeUserPackages) {
      if (!userPackage.user || !userPackage.user.deviceToken) {
        continue;
      }

      const remainingSessions = await calculateActualRemainingSessions(
        userPackage
      );

      const reminderId = `3sessions_${userPackage._id}`;

      if (remainingSessions === 3) {
        if (!sentReminders.has(reminderId)) {
          await sendThreeSessionsReminder(userPackage, remainingSessions);
          sentReminders.add(reminderId);
        }
      } else {
        if (sentReminders.has(reminderId)) {
          sentReminders.delete(reminderId);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in auto reminder:", error);
  }
}

// Calculate actual remaining sessions that can be booked
async function calculateActualRemainingSessions(userPackage) {
  const totalSessions = userPackage.totalSlots || 0;
  const bookedSessions = userPackage.slots || 0;
  const remainingSessions = totalSessions - bookedSessions;

  return remainingSessions;
}

// Send the 3 sessions left notification
async function sendThreeSessionsReminder(userPackage, remainingSessions) {
  try {
    const message = {
      token: userPackage.user.deviceToken,
      notification: {
        title: "📅 Only 3 Sessions Left!",
        body: `You have ${remainingSessions} sessions remaining in your ${userPackage.package.name} package. Consider booking your next sessions soon!`,
      },
      data: {
        type: "session_reminder",
        userPackageId: userPackage._id.toString(),
        packageName: userPackage.package.name,
        remainingSessions: remainingSessions.toString(),
        paymentStatus: userPackage.paymentStatus,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    await admin.messaging().send(message);
    console.log(`✅ 3-session notification sent to ${userPackage.user.name}`);
  } catch (error) {
    console.error(`❌ Error sending notification:`, error.message);
    if (
      error.code === "messaging/mismatched-credential" ||
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      await User.findByIdAndUpdate(userPackage.user._id, {
        $unset: { deviceToken: 1 },
      });
      console.log(`🗑️ Removed invalid/mismatched token for ${userPackage.user.name}`);
    }
  }
}

async function checkForExpiredPackages() {
  try {
    const today = new Date();

    // Get all paid user packages that haven't received expiry notification
    const userPackages = await UserPackagesM.find({
      paymentStatus: "paid",
      expiryNotificationSent: { $ne: true }, // Only packages that haven't received notification
    })
      .populate("user")
      .populate("package");

    console.log(`📦 Checking ${userPackages.length} paid packages for expiry`);

    for (const userPackage of userPackages) {
      if (!userPackage.user || !userPackage.user.deviceToken) {
        continue;
      }

      const expiryDate = calculateExpiryDate(userPackage);

      if (isPackageExpired(expiryDate, today)) {
        await sendExpiryNotification(userPackage, expiryDate);
      }
    }
  } catch (error) {
    console.error("❌ Error in expiry reminder:", error);
  }
}

// Calculate expiry date based on package rules
function calculateExpiryDate(userPackage) {
  // If extended validity exists, use that
  if (userPackage.extendedValidityEndDate) {
    return new Date(userPackage.extendedValidityEndDate);
  }

  // Calculate from package duration and creation date
  const createdAt = new Date(userPackage.createdAt);
  const expiryDate = new Date(createdAt);

  if (userPackage.package && userPackage.package.duration) {
    expiryDate.setDate(expiryDate.getDate() + userPackage.package.duration);
  } else {
    // Default fallback - 30 days from creation
    expiryDate.setDate(expiryDate.getDate() + 30);
  }

  return expiryDate;
}

// Check if package is expired
function isPackageExpired(expiryDate, today) {
  // Reset times to compare only dates
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  return todayDate > expiry;
}

// Send expiry notification
async function sendExpiryNotification(userPackage, expiryDate) {
  try {
    const expiryFormatted = expiryDate.toLocaleDateString();
    const remainingSessions = await calculateActualRemainingSessions(
      userPackage
    );

    const message = {
      token: userPackage.user.deviceToken,
      notification: {
        title: "⏰ Package Expired!",
        body: `Your ${userPackage.package.name} package expired on ${expiryFormatted}. You had ${remainingSessions} unused sessions.`,
      },
      data: {
        type: "package_expired",
        userPackageId: userPackage._id.toString(),
        packageName: userPackage.package.name,
        expiryDate: expiryDate.toISOString(),
        remainingSessions: remainingSessions.toString(),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    await admin.messaging().send(message);

    // Mark as notification sent in database
    await UserPackagesM.findByIdAndUpdate(userPackage._id, {
      $set: {
        expiryNotificationSent: true,
        expiryNotificationSentAt: new Date(),
      },
    });

    console.log(
      `✅ Expiry notification sent to ${userPackage.user.name} and marked in database`
    );
  } catch (error) {
    console.error(`❌ Error sending expiry notification:`, error);

    // Remove invalid or mismatched device tokens
    if (
      error.code === "messaging/mismatched-credential" ||
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      await User.findByIdAndUpdate(userPackage.user._id, {
        $unset: { deviceToken: 1 },
      });
      console.log(`🗑️ Removed invalid/mismatched token for ${userPackage.user.name}`);
    }
  }
}

// Calculate remaining sessions
async function calculateActualRemainingSessions(userPackage) {
  const totalSessions = userPackage.totalSlots || 0;
  const bookedSessions = userPackage.slots || 0;
  const remainingSessions = totalSessions - bookedSessions;
  return remainingSessions;
}

module.exports = {
  startAutoReminder,
  checkForThreeSessionsLeft,
};
