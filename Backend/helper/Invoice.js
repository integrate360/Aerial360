// const sgMail = require("@sendgrid/mail");
// const moment = require("moment");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");
// sgMail.setApiKey(process.env.Sendgrid_Key);

// const addCompanyDetails = (doc) => {
//   doc
//     .fontSize(16)
//     .fillColor("#4a148cff")
//     .text("Company Details", 50, 150)
//     .moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(12)
//     .fillColor("black")
//     .font("Helvetica-Bold")
//     .text("Airbound", 70, boxStart + 15)
//     .font("Helvetica")
//     .fontSize(10)
//     .text("2nd floor Empressa,", 70, boxStart + 35)
//     .text("Ram Krishna Nagar, 2nd Road,", 70, boxStart + 50)
//     .text("Khar West, Mumbai - 400052", 70, boxStart + 65);

//   doc.moveDown(4);
// };

// const addBillToSection = (doc, user) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Customer Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text(`Name: ${user.name || "N/A"}`, 70, boxStart + 15)
//     .text(`Email: ${user.email || "N/A"}`, 70, boxStart + 35)
//     .text(`Phone: ${user.phone || "N/A"}`, 70, boxStart + 55);

//   doc.moveDown(4);
// };

// const addBookingDetails = (doc, booking) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Booking Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 100).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text(`Class Name: ${booking.className}`, 70, boxStart + 15)
//     .text(`Location: ${booking.location || "N/A"}`, 70, boxStart + 35)
//     .text(
//       `Dates: ${
//         booking?.isPackage ? "Multiple Dates" : booking.dates.join(", ")
//       }`,
//       70,
//       boxStart + 55
//     )
//     .text(`Total Amount: INR ${booking.totalAmount}`, 70, boxStart + 75);

//   doc.moveDown(4);
// };

// const addContactInfo = (doc) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Contact Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text("Phone: +917506113884", 70, boxStart + 15)
//     .text("Email: hello@airbound.in", 70, boxStart + 35)
//     .text("Website: www.airbound.in", 70, boxStart + 55);

//   doc.moveDown(2);
// };

// const generatePDFInvoice = (booking, user, outputPath) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 50, size: "A4" });
//     const writeStream = fs.createWriteStream(outputPath);

//     doc.pipe(writeStream);

//     // Header with Logo and Invoice Info
//     const logoPath = path.join(__dirname, "airbound.jpg");
//     if (fs.existsSync(logoPath)) {
//       doc.image(logoPath, 50, 30, { width: 60 });
//     }

//     // Invoice Details - Moved to top right with better formatting
//     const invoiceDate = new Date().toLocaleDateString("en-GB");
//     const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("black")
//       .text(`Invoice Number: ${invoiceNumber}`, 300, 40)
//       .text(`Invoice Date: ${invoiceDate}`, 300, 60);

//     // Blue separator line
//     doc
//       .strokeColor("#4a148cff")
//       .lineWidth(2)
//       .moveTo(50, 120)
//       .lineTo(550, 120)
//       .stroke();

//     // Add sections with improved spacing
//     addCompanyDetails(doc);
//     addBillToSection(doc, user);
//     addBookingDetails(doc, booking);
//     addContactInfo(doc);

//     // Footer with better styling
//     doc
//       .fontSize(14)
//       .fillColor("#4a148cff")
//       .font("Helvetica-Bold")
//       .text("Thank you for choosing our service!", { align: "center" })
//       .moveDown()
//       .fontSize(10)
//       .fillColor("#666666")
//       .font("Helvetica")
//       .text("For any queries, please contact us at hello@airbound.in", {
//         align: "center",
//       });

//     doc.end();
//     writeStream.on("finish", () => resolve(outputPath));
//     writeStream.on("error", reject);
//   });
// };
// const sendEmail = async ({ to, subject, body, attachmentPath }) => {
//   const msg = {
//     to,
//     from: "airboundfitness@gmail.com",
//     subject,
//     text: body,
//     html: body,
//     attachments: [
//       {
//         content: fs.readFileSync(attachmentPath).toString("base64"),
//         filename: "Invoice.pdf",
//         type: "application/pdf",
//         disposition: "attachment",
//       },
//     ],
//   };

//   try {
//     await sgMail.send(msg);
//   } catch (error) {
//     console.error(
//       "Failed to send email:",
//       error.response?.body || error.message
//     );
//     throw new Error("Error sending email");
//   }
// };
// const sendInvoiceToUser = async (user, booking) => {
//   if (!user?.email || !user?.name)
//     throw new Error("User information is incomplete");
//   if (!booking?.className || !booking?.dates)
//     throw new Error("Booking information is incomplete");

//   // --- Start of Google Calendar Link Generation ---

//   // Assuming a one-hour duration for the class.
//   // You should pass the actual start time to this function if available.
//   const eventDate = moment(booking.dates[0]).format("YYYY-MM-DD");
//   const startTime = "T10:00:00"; // Example: 10:00 AM. Replace with actual class time.
//   const endTime = "T11:00:00"; // Example: 11:00 AM. Replace with actual class time.

//   const startDate = moment(eventDate + startTime)
//     .toISOString()
//     .replace(/-|:|\.\d{3}/g, "");
//   const endDate = moment(eventDate + endTime)
//     .toISOString()
//     .replace(/-|:|\.\d{3}/g, "");

//   const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
//     booking.className
//   )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
//     `Booking for ${booking.className}`
//   )}&location=${encodeURIComponent(booking.location || "N/A")}`;

//   // --- End of Google Calendar Link Generation ---

//   const outputPath = path.join(__dirname, "Invoice.pdf");

//   try {
//     await generatePDFInvoice(booking, user, outputPath);

//     const customerEmail = {
//       to: user.email,
//       subject: `Invoice for Your Booking - ${booking.className}`,
//       body: `
//         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
//           <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
//             <strong>Thank You for Your Booking, ${user.name}!</strong>
//           </div>
//           <p style="font-size: 16px; color: #555; text-align: center; margin-top: 20px;">
//             We are excited to confirm your booking. Please find your invoice attached.
//           </p>
//           <div style="text-align: center; margin-top: 20px;">
//             <a href="${googleCalendarUrl}" target="_blank" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Add to Google Calendar</a>
//           </div>
//         </div>
//       `,
//       attachmentPath: outputPath,
//     };

//     const adminEmail = {
//       to: "airboundfitness@gmail.com",
//       subject: "Airbound Fitness - You Have a New Booking",
//       body: `
//         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
//           <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
//             <strong>You Have a New Booking</strong>
//           </div>
//           <p style="font-size: 16px; color: #555; margin-top: 20px;">
//             A new booking has been made by <strong>${user.name}</strong>.
//           </p>
//           <p style="font-size: 16px; color: #555;">
//             <strong>Booking Details:</strong>
//           </p>
//           <ul style="font-size: 14px; color: #555; margin-left: 20px;">
//             <li><strong>Item Name:</strong> ${booking.className}</li>
//             <li><strong>Location:</strong> ${booking.location || "N/A"}</li>
//             <li><strong>Dates:</strong> ${booking.dates.join(", ")}</li>
//             <li><strong>Total Amount:</strong> ${
//               `INR ${booking.totalAmount}` || "N/A"
//             }</li>
//           </ul>
//         </div>
//       `,
//       attachmentPath: outputPath,
//     };

//     await Promise.all([sendEmail(customerEmail), sendEmail(adminEmail)]);

//     console.log(`Invoices sent successfully for booking: ${booking.className}`);
//   } catch (error) {
//     console.error("Failed to send invoice:", error.message);
//     throw new Error("Error sending invoice");
//   } finally {
//     if (fs.existsSync(outputPath)) {
//       fs.unlinkSync(outputPath);
//     }
//   }
// };

// module.exports = { sendInvoiceToUser };







// const sgMail = require("@sendgrid/mail");
// const moment = require("moment");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");
// sgMail.setApiKey(process.env.Sendgrid_Key);

// const addCompanyDetails = (doc) => {
//   doc
//     .fontSize(16)
//     .fillColor("#4a148cff")
//     .text("Company Details", 50, 150)
//     .moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(12)
//     .fillColor("black")
//     .font("Helvetica-Bold")
//     .text("Airbound", 70, boxStart + 15)
//     .font("Helvetica")
//     .fontSize(10)
//     .text("2nd floor Empressa,", 70, boxStart + 35)
//     .text("Ram Krishna Nagar, 2nd Road,", 70, boxStart + 50)
//     .text("Khar West, Mumbai - 400052", 70, boxStart + 65);

//   doc.moveDown(4);
// };

// const addBillToSection = (doc, user) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Customer Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text(`Name: ${user.name || "N/A"}`, 70, boxStart + 15)
//     .text(`Email: ${user.email || "N/A"}`, 70, boxStart + 35)
//     .text(`Phone: ${user.phone || "N/A"}`, 70, boxStart + 55);

//   doc.moveDown(4);
// };

// const addBookingDetails = (doc, booking) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Booking Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 100).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text(`Class Name: ${booking.className}`, 70, boxStart + 15)
//     .text(`Location: ${booking.location || "N/A"}`, 70, boxStart + 35)
//     .text(
//       `Dates: ${
//         booking?.isPackage ? "Multiple Dates" : booking.dates.join(", ")
//       }`,
//       70,
//       boxStart + 55
//     )
//     .text(`Total Amount: INR ${booking.totalAmount}`, 70, boxStart + 75);

//   doc.moveDown(4);
// };

// const addContactInfo = (doc) => {
//   doc.fontSize(16).fillColor("#4a148cff").text("Contact Details").moveDown(0.5);

//   const boxStart = doc.y;
//   doc.strokeColor("#e6e6e6").lineWidth(1).rect(50, boxStart, 500, 80).stroke();

//   doc
//     .fontSize(10)
//     .fillColor("black")
//     .text("Phone: +917506113884", 70, boxStart + 15)
//     .text("Email: hello@airbound.in", 70, boxStart + 35)
//     .text("Website: www.airbound.in", 70, boxStart + 55);

//   doc.moveDown(2);
// };

// const generatePDFInvoice = (booking, user, outputPath) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 50, size: "A4" });
//     const writeStream = fs.createWriteStream(outputPath);

//     doc.pipe(writeStream);

//     // Header with Logo and Invoice Info
//     const logoPath = path.join(__dirname, "airbound.jpg");
//     if (fs.existsSync(logoPath)) {
//       doc.image(logoPath, 50, 30, { width: 60 });
//     }

//     // Invoice Details - Moved to top right with better formatting
//     const invoiceDate = new Date().toLocaleDateString("en-GB");
//     const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("black")
//       .text(`Invoice Number: ${invoiceNumber}`, 300, 40)
//       .text(`Invoice Date: ${invoiceDate}`, 300, 60);

//     // Blue separator line
//     doc
//       .strokeColor("#4a148cff")
//       .lineWidth(2)
//       .moveTo(50, 120)
//       .lineTo(550, 120)
//       .stroke();

//     // Add sections with improved spacing
//     addCompanyDetails(doc);
//     addBillToSection(doc, user);
//     addBookingDetails(doc, booking);
//     addContactInfo(doc);

//     // Footer with better styling
//     doc
//       .fontSize(14)
//       .fillColor("#4a148cff")
//       .font("Helvetica-Bold")
//       .text("Thank you for choosing our service!", { align: "center" })
//       .moveDown()
//       .fontSize(10)
//       .fillColor("#666666")
//       .font("Helvetica")
//       .text("For any queries, please contact us at hello@airbound.in", {
//         align: "center",
//       });

//     doc.end();
//     writeStream.on("finish", () => resolve(outputPath));
//     writeStream.on("error", reject);
//   });
// };

// const sendEmail = async ({ to, subject, body, attachmentPath }) => {
//   const msg = {
//     to,
//     from: "airboundfitness@gmail.com",
//     subject,
//     text: body,
//     html: body,
//     attachments: attachmentPath ? [
//       {
//         content: fs.readFileSync(attachmentPath).toString("base64"),
//         filename: "Invoice.pdf",
//         type: "application/pdf",
//         disposition: "attachment",
//       },
//     ] : undefined,
//   };

//   try {
//     await sgMail.send(msg);
//     return true;
//   } catch (error) {
//     console.error(
//       "Failed to send email:",
//       error.response?.body || error.message
//     );
//     return false;
//   }
// };

// const sendInvoiceToUser = async (user, booking) => {
//   if (!user?.email || !user?.name) {
//     console.error("User information is incomplete");
//     return { success: false, message: "User information is incomplete" };
//   }

//   if (!booking?.className || !booking?.dates) {
//     console.error("Booking information is incomplete");
//     return { success: false, message: "Booking information is incomplete" };
//   }

//   // Generate Google Calendar link
//   const eventDate = moment(booking.dates[0]).format("YYYY-MM-DD");
//   const startTime = "T10:00:00";
//   const endTime = "T11:00:00";

//   const startDate = moment(eventDate + startTime)
//     .toISOString()
//     .replace(/-|:|\.\d{3}/g, "");
//   const endDate = moment(eventDate + endTime)
//     .toISOString()
//     .replace(/-|:|\.\d{3}/g, "");

//   const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
//     booking.className
//   )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
//     `Booking for ${booking.className}`
//   )}&location=${encodeURIComponent(booking.location || "N/A")}`;

//   const outputPath = path.join(__dirname, "Invoice.pdf");
//   let emailSuccess = true;

//   try {
//     // Generate the invoice PDF
//     await generatePDFInvoice(booking, user, outputPath);

//     // Prepare email content
//     const customerEmail = {
//       to: user.email,
//       subject: `Invoice for Your Booking - ${booking.className}`,
//       body: `
//         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
//           <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
//             <strong>Thank You for Your Booking, ${user.name}!</strong>
//           </div>
//           <p style="font-size: 16px; color: #555; text-align: center; margin-top: 20px;">
//             We are excited to confirm your booking. Please find your invoice attached.
//           </p>
//           <div style="text-align: center; margin-top: 20px;">
//             <a href="${googleCalendarUrl}" target="_blank" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Add to Google Calendar</a>
//           </div>
//         </div>
//       `,
//       attachmentPath: outputPath,
//     };

//     const adminEmail = {
//       to: "airboundfitness@gmail.com",
//       subject: "Airbound Fitness - You Have a New Booking",
//       body: `
//         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
//           <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
//             <strong>You Have a New Booking</strong>
//           </div>
//           <p style="font-size: 16px; color: #555; margin-top: 20px;">
//             A new booking has been made by <strong>${user.name}</strong>.
//           </p>
//           <p style="font-size: 16px; color: #555;">
//             <strong>Booking Details:</strong>
//           </p>
//           <ul style="font-size: 14px; color: #555; margin-left: 20px;">
//             <li><strong>Item Name:</strong> ${booking.className}</li>
//             <li><strong>Location:</strong> ${booking.location || "N/A"}</li>
//             <li><strong>Dates:</strong> ${booking.dates.join(", ")}</li>
//             <li><strong>Total Amount:</strong> ${
//               `INR ${booking.totalAmount}` || "N/A"
//             }</li>
//           </ul>
//         </div>
//       `,
//       attachmentPath: outputPath,
//     };

//     // Try to send emails but don't let failures block the booking
//     try {
//       const [customerResult, adminResult] = await Promise.all([
//         sendEmail(customerEmail),
//         sendEmail(adminEmail)
//       ]);

//       if (!customerResult || !adminResult) {
//         emailSuccess = false;
//         console.error("One or more emails failed to send");
//       }
//     } catch (emailError) {
//       emailSuccess = false;
//       console.error("Email sending failed:", emailError);
//     }

//     return { 
//       success: true, 
//       bookingCreated: true, 
//       emailSent: emailSuccess,
//       invoicePath: outputPath
//     };
//   } catch (error) {
//     console.error("Error in booking process:", error);
//     return { 
//       success: false, 
//       message: error.message,
//       bookingCreated: false,
//       emailSent: false
//     };
//   } finally {
//     // Clean up the temporary invoice file
//     if (fs.existsSync(outputPath)) {
//       try {
//         fs.unlinkSync(outputPath);
//       } catch (cleanupError) {
//         console.error("Failed to clean up invoice file:", cleanupError);
//       }
//     }
//   }
// };

// module.exports = { sendInvoiceToUser };


















const AWS = require("aws-sdk");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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
    .text("Airbound", 70, boxStart + 15)
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

module.exports = { sendInvoiceToUser };