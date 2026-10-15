
const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../config/airboundapp-146f2-7eba6638c5b9.json"), 
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

const addEventToGoogleCalendar = async (
  user,
  { title, description, start, end }
) => {
  try {
    const event = {
      summary: title,
      description: `${description}\nBooked by: ${user.email}`,
      start: {
        dateTime: start,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: end,
        timeZone: "Asia/Kolkata",
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary", // OR use actual calendar ID
      resource: event,
    });

    console.log("Google Calendar event added:", response.data.htmlLink);
  } catch (error) {
    console.error("Error adding Google Calendar event:", error.message);
  }
};

module.exports = { addEventToGoogleCalendar };