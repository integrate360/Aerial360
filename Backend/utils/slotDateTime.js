import moment from "moment";

const DEFAULT_SLOT_FORMATS = [
  "DD-MM-YYYY HH:mm",
  "DD-MM-YYYY H:mm",
  "DD-MM-YYYY hh:mm A",
  "DD-MM-YYYY h:mm A",
  "DD-MM-YYYY hh:mmA",
  "DD-MM-YYYY h:mmA",
];

function parseSlotDateTime(dateStr, timeStr, utcOffsetMinutes = 330) {
  return moment(
    `${dateStr} ${timeStr}`,
    DEFAULT_SLOT_FORMATS,
    true,
  ).utcOffset(utcOffsetMinutes, true);
}

export {
  parseSlotDateTime,
};

