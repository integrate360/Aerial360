const moment = require("moment");
function getEffectivePackageExpiry(userPackage) {
  if (!userPackage) return null;

  // 1. Extended validity end date
  if (userPackage.extendedValidityEndDate) {
    return moment(userPackage.extendedValidityEndDate).endOf("day");
  }

  // 2. Validity end date stored on model
  if (userPackage.validityEndDate) {
    return moment(userPackage.validityEndDate).endOf("day");
  }

  // 3. Fallback calculation from creation/start date + package duration
  let startDate = userPackage.validityStartDate || userPackage.createdAt;

  // If no creation date directly on userPackage, check earliest booking date if available
  if (!startDate && userPackage.bookings && userPackage.bookings.length > 0) {
    const dates = userPackage.bookings.flatMap((b) =>
      b && b.dates ? b.dates.map((d) => new Date(d)) : []
    );
    if (dates.length > 0) {
      startDate = new Date(Math.min(...dates));
    }
  }

  if (!startDate) {
    startDate = new Date(); // default fallback
  }

  const duration =
    userPackage.package && userPackage.package.duration
      ? Number(userPackage.package.duration)
      : 30;

  return moment(startDate).add(duration, "days").endOf("day");
}

module.exports = {
  getEffectivePackageExpiry,
};
