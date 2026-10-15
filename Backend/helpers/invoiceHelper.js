import AWS from "aws-sdk";
import moment from "moment";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "ap-south-1",
});

const addCompanyDetails = (doc) => {
  doc
    .fontSize(16)
    .fillColor("#4a148cff")
    .text("Company Details", 50, 150)
    .moveDown(0.5);

  const boxStart = doc.y;
  doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

  doc
    .fontSize(12)
    .fillColor("black")
    .font("Helvetica-Bold")
    .text("Aerial360", 70, boxStart + 15)
    .font("Helvetica")
    .fontSize(10)
    .text("2nd floor Empressa,", 70, boxStart + 35)
    .text("Ram Krishna Nagar, 2nd Road,", 70, boxStart + 50)
    .text("Khar West, Mumbai - 400052", 70, boxStart + 65);

  doc.moveDown(4);
};

const addBillToSection = (doc, user) => {
  doc.fontSize(16).fillColor("#4a148cff").text("Customer Details").moveDown(0.5);

  const boxStart = doc.y;
  doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

  doc
    .fontSize(10)
    .fillColor("black")
    .text(`Name: ${user.name || "N/A"}`, 70, boxStart + 15)
    .text(`Email: ${user.email || "N/A"}`, 70, boxStart + 35)
    .text(`Phone: ${user.phone || "N/A"}`, 70, boxStart + 55);

  doc.moveDown(4);
};

const addContactInfo = (doc) => {
  doc.fontSize(16).fillColor("#4a148cff").text("Contact Details").moveDown(0.5);

  const boxStart = doc.y;
  doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

  doc
    .fontSize(10)
    .fillColor("black")
    .text("Phone: +917506113884", 70, boxStart + 15)
    .text("Email: hello@airbound.in", 70, boxStart + 35)
    .text("Website: www.airbound.in", 70, boxStart + 55);

  doc.moveDown(2);
};

const generatePDFInvoice = (booking, user, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Header with Logo and Invoice Info
    const logoPath = path.join(__dirname, "airbound.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }

    // Invoice Details - Moved to top right with better formatting
    const invoiceDate = new Date().toLocaleDateString("en-GB");
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice Number: ${invoiceNumber}`, 300, 40)
      .text(`Invoice Date: ${invoiceDate}`, 300, 60);

    // Blue separator line
    doc
      .strokeColor("#4a148cff")
      .lineWidth(2)
      .moveTo(50, 120)
      .lineTo(550, 120)
      .stroke();

    // Add sections with improved spacing
    addCompanyDetails(doc);
    addBillToSection(doc, user);
    addBookingDetails(doc, booking);
    addContactInfo(doc);

    // Footer with better styling
    doc
      .fontSize(14)
      .fillColor("#4a148cff")
      .font("Helvetica-Bold")
      .text("Thank you for choosing our service!", { align: "center" })
      .moveDown()
      .fontSize(10)
      .fillColor("#666666")
      .font("Helvetica")
      .text("For any queries, please contact us at hello@airbound.in", {
        align: "center",
      });

    doc.end();
    writeStream.on("finish", () => resolve(outputPath));
    writeStream.on("error", reject);
  });
};

// Update the addBookingDetails function to handle multiple classes
const addBookingDetails = (doc, booking) => {
  doc.fontSize(16).fillColor("#4a148cff").text("Booking Details").moveDown(0.5);

  const boxStart = doc.y;

  // Base height (for package + total amount + "Classes:")
  const baseHeight = 75;
  // Each class line roughly takes ~20px height
  const classHeight = booking.classes.length * 20;
  // Add some extra margin at bottom so text won’t overlap
  const bottomMargin = 20;

  const boxHeight = baseHeight + classHeight + bottomMargin;

  // Draw the box with dynamic height
  doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, boxHeight).stroke();

  doc
    .fontSize(10)
    .fillColor("black")
    .text(`Package: ${booking.packageName || "Custom Package"}`, 70, boxStart + 15)
    .text(`Total Amount: INR ${booking.totalAmount}`, 70, boxStart + 35);

  // Add class details
  let yPosition = boxStart + 60;
  doc.text("Classes:", 70, yPosition);

  booking.classes.forEach((classItem, index) => {
    yPosition += 20;

    // Convert time to 12-hour format with AM/PM
    let formattedTime = "";
    if (classItem.time) {
      const [hours, minutes] = classItem.time.split(":");
      const dateObj = new Date();
      dateObj.setHours(Number(hours), Number(minutes));
      formattedTime = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    doc.text(
      `${index + 1}. ${classItem.name} - ${classItem.date} at ${formattedTime} (${classItem.location})`,
      90,
      yPosition
    );
  });

  // Push cursor below the box for the next section
  doc.y = boxStart + boxHeight + 10;
};


const sendEmail = async ({ to, subject, body, attachmentPath }) => {
  // Read the PDF file
  const pdfData = fs.readFileSync(attachmentPath);
  const pdfBase64 = pdfData.toString("base64");

  // Construct raw email (RFC 822 format)
  const rawEmail = [
    `From: Airbound Fitness <airboundfitness@airbound.in>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="NextPart"`,
    ``,
    `--NextPart`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    body,
    ``,
    `--NextPart`,
    `Content-Type: application/pdf; name="Invoice.pdf"`,
    `Content-Disposition: attachment; filename="Invoice.pdf"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    `--NextPart--`,
  ].join("\n");

  const params = {
    RawMessage: { Data: rawEmail },
    Source: "airboundfitness@airbound.in", // must be verified in SES
    Destinations: [to],
  };

  try {
    await ses.sendRawEmail(params).promise();
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Error sending email");
  }
};

const sendInvoiceToUser = async (user, booking) => {
  console.log("User data:", user);
  console.log("Booking data:", booking);

  if (!user?.email || !user?.name) {
    throw new Error("User information is incomplete");
  }

  // Check for the new booking structure
  if (!booking?.classes || !Array.isArray(booking.classes) || booking.classes.length === 0) {
    throw new Error("Booking information is incomplete - missing classes array");
  }

  // --- Start of Google Calendar Link Generation for Multiple Events ---
  let googleCalendarUrls = [];

  for (const classItem of booking.classes) {
    const eventDate = moment(classItem.date, "MMM DD, YYYY").format("YYYY-MM-DD");
    const startTime = classItem.time ? `T${classItem.time}:00` : "T10:00:00";
    const endTime = classItem.duration ?
      `T${moment(classItem.time, 'HH:mm').add(classItem.duration, 'minutes').format('HH:mm')}:00` :
      "T11:00:00";

    const startDate = moment(eventDate + startTime)
      .toISOString()
      .replace(/-|:|\.\d{3}/g, "");
    const endDate = moment(eventDate + endTime)
      .toISOString()
      .replace(/-|:|\.\d{3}/g, "");

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      classItem.name
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      `Booking for ${classItem.name} at ${classItem.location || "N/A"}`
    )}&location=${encodeURIComponent(classItem.location || "N/A")}`;

    googleCalendarUrls.push(googleCalendarUrl);
  }

  // Create HTML for multiple calendar links
  const calendarLinksHtml = googleCalendarUrls.map((url, index) => {
    const classItem = booking.classes[index];
    return `
      <div style="margin: 10px 0;">
        <a href="${url}" target="_blank" style="background-color: #4a148cff; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block;">
          Add ${classItem.name} on ${classItem.date} to Calendar
        </a>
      </div>
    `;
  }).join('');

  // --- End of Google Calendar Link Generation ---

  const outputPath = path.join(__dirname, "Invoice.pdf");

try {
  await generatePDFInvoice(booking, user, outputPath);

  const customerEmail = {
    to: user.email,
    subject: `Invoice for Your Booking - ${booking.packageName || 'Multiple Classes'}`,
    body: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Thank You, ${user.name}!</h1>
          </div>

          <!-- Body -->
          <div style="padding: 25px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px; text-align: center; margin-bottom: 20px;">
              We’re excited to confirm your booking. Please find your <strong>invoice attached</strong>.
            </p>

            <!-- Add to Calendar Section -->
            <div style="border: 2px solid #4a148cff; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f0f7ff;">
              <h3 style="color:#4a148cff; margin-top: 0; text-align: center; font-size: 18px;">
                📅 Add Your Classes to Calendar
              </h3>
              <p style="font-size: 14px; text-align: center; margin-bottom: 15px;">
                Never miss a class! Click the links below to add them directly to your calendar.
              </p>
              <div style="text-align: center; font-size: 14px;">
                ${calendarLinksHtml}
              </div>
            </div>

            <p style="font-size: 14px; text-align: center; color: #666; margin-top: 20px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      </div>
    `,
    attachmentPath: outputPath,
  };


    // Helper function to convert "HH:mm" to "hh:mm AM/PM"
    const formatTime12Hour = (timeStr) => {
      if (!timeStr) return "N/A";
      const [hours, minutes] = timeStr.split(":");
      const dateObj = new Date();
      dateObj.setHours(Number(hours), Number(minutes));
      return dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const adminEmail = {
      to: "airboundfitness@gmail.com",
      subject: "Airbound Fitness - You Have a New Booking",
      body: `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
        <strong>You Have a New Booking</strong>
      </div>
      <p style="font-size: 16px; color: #555; margin-top: 20px;">
        A new booking has been made by <strong>${user.name}</strong>.
      </p>
      <p style="font-size: 16px; color: #555;">
        <strong>Booking Details:</strong>
      </p>
      <ul style="font-size: 14px; color: #555; margin-left: 20px;">
        <li><strong>Package:</strong> ${booking.packageName || "Custom Package"}</li>
        <li><strong>Total Amount:</strong> INR ${booking.totalAmount || "N/A"}</li>
        <li><strong>Number of Classes:</strong> ${booking.classes.length}</li>
      </ul>
      <p style="font-size: 16px; color: #555; margin-top: 15px;">
        <strong>Class Details:</strong>
      </p>
      <ul style="font-size: 14px; color: #555; margin-left: 20px;">
        ${booking.classes
          .map(
            (classItem) => `
            <li>
              ${classItem.name} - ${classItem.date} at ${formatTime12Hour(classItem.time)} 
              (${classItem.location || "N/A"})
            </li>
          `
          )
          .join("")}
      </ul>
    </div>
  `,
      attachmentPath: outputPath,
    };


    await Promise.all([sendEmail(customerEmail), sendEmail(adminEmail)]);

    console.log(`Invoices sent successfully for booking with ${booking.classes.length} classes`);
  } catch (error) {
    console.error("Failed to send invoice:", error.message);
    throw new Error("Error sending invoice");
  } finally {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
};

export { sendInvoiceToUser };