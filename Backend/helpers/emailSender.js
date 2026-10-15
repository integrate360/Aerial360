import AWS from "aws-sdk";
import ics from "ics";

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

const sendEmailToUser = async (user, newDates, classBody) => {
  
  if (!user.email) {
    console.error(`No email found for user: ${user?.name}`);
    return;
  }

  // Minimal email styles
  const emailStyles = `
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f8f9fa;
        color: #333;
        line-height: 1.5;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: #4a148cff;
        color: white;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .header .logo {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 16px;
        margin-bottom: 24px;
      }
      .class-section {
        background: #f1f5f9;
        border-radius: 6px;
        padding: 20px;
        margin: 24px 0;
      }
      .class-title {
        font-size: 18px;
        font-weight: 600;
        color: #4a148cff;
        margin: 0 0 16px 0;
      }
      .info-row {
        display: flex;
        align-items: center;
        margin: 8px 0;
        min-height: 24px;
      }
      .info-label {
        font-weight: 500;
        color: #64748b;
        min-width: 80px;
        flex-shrink: 0;
        margin-right: 12px;
      }
      .info-value {
        color: #334155;
        flex: 1;
        word-break: break-word;
      }
      .dates-section {
        margin: 24px 0;
      }
      .dates-title {
        font-size: 16px;
        font-weight: 600;
        color: #4a148cff;
        margin-bottom: 12px;
      }
      .date-item {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px 16px;
        margin: 8px 0;
        font-size: 15px;
      }
      .apology {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 6px;
        padding: 16px;
        margin: 24px 0;
        font-size: 14px;
        color: #dc2626;
      }
      .footer {
        background: #f8fafc;
        padding: 20px 24px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        font-size: 14px;
        color: #64748b;
      }
      @media (max-width: 600px) {
        body {
          padding: 10px;
        }
        .content {
          padding: 24px 16px;
        }
        .info-row {
          flex-direction: column;
          align-items: flex-start;
        }
        .info-label {
          min-width: auto;
          margin-right: 0;
          margin-bottom: 4px;
        }
      }
    </style>
  `;

  // Minimal user email content
  const userEmailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Class Rescheduled</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Aerial360 Academy</div>
          <h1>Class Rescheduled</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hi ${user.name},
          </div>
          
          <p>Your fitness class has been rescheduled to new dates. Please find the updated schedule below:</p>
          
          <div class="class-section">
            <div class="class-title">${classBody?.name || 'Your Fitness Class'}</div>
            ${classBody?.location ? `
              <div class="info-row">
                <div class="info-label">Location:</div>
                <div class="info-value">${classBody.location}</div>
              </div>
            ` : ''}
            ${classBody?.instructor ? `
              <div class="info-row">
                <div class="info-label">Instructor:</div>
                <div class="info-value">${classBody.instructor}</div>
              </div>
            ` : ''}
          </div>

          <div class="dates-section">
            <div class="dates-title">New Class Dates</div>
            ${newDates
              .map(date => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return `
                  <div class="date-item">
                    ${formattedDate} at ${formattedTime}
                  </div>
                `;
              })
              .join('')}
          </div>

          <div class="apology">
            We apologize for any inconvenience caused by this schedule change.
          </div>

          <p>If you have any questions, please don't hesitate to contact us.</p>

          <p>
            Best regards,<br>
            <strong>Aerial360 Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <div>Aerial360 Fitness & Arts Academy</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Minimal admin email content
  const adminEmailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Class Reschedule Notification</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Aerial360 Admin</div>
          <h1>Class Rescheduled</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Class reschedule notification
          </div>
          
          <div class="class-section">
            <div class="class-title">${classBody?.name}</div>
            ${classBody?.location ? `
              <div class="info-row">
                <div class="info-label">Location:</div>
                <div class="info-value">${classBody.location}</div>
              </div>
            ` : ''}
            ${classBody?.instructor ? `
              <div class="info-row">
                <div class="info-label">Instructor:</div>
                <div class="info-value">${classBody.instructor}</div>
              </div>
            ` : ''}
          </div>

          <div class="class-section">
            <div class="class-title">User Details</div>
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${user.name}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${user.email}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value">${user.phone || 'N/A'}</div>
            </div>
          </div>

          <div class="dates-section">
            <div class="dates-title">New Schedule</div>
            ${newDates
              .map(date => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return `
                  <div class="date-item">
                    ${formattedDate} at ${formattedTime}
                  </div>
                `;
              })
              .join('')}
          </div>

          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 16px; margin: 24px 0; font-size: 14px;">
            <strong>Status:</strong> Reschedule notification sent to ${user.name} (${user.email}) with calendar attachment.
          </div>
        </div>
        
        <div class="footer">
          <div>Generated on ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create calendar events (unchanged)
  const events = newDates.map((date) => {
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      title: `Rescheduled Class: ${classBody?.name}`,
      description: `Your class ${classBody?.name} has been rescheduled.${classBody?.location ? ` Location: ${classBody.location}` : ''}`,
      location: classBody?.location || '',
      status: "CONFIRMED",
      organizer: {
        name: "Aerial360 Academy",
        email: "contact@aerial360.in",
      },
      attendees: [{ name: user.name, email: user.email }],
    };
  });

  const { error, value: icsContent } = ics.createEvents(events);
  if (error) {
    console.error("Error generating .ics file:", error);
    return;
  }

  try {
    // Send email to user with ICS attachment
    const userRawEmail = createRawEmailWithAttachment(
      user.email,
      "Your Aerial360 Class Has Been Rescheduled",
      userEmailContent,
      icsContent
    );

    const userParams = {
      Source: "Aerial360 Academy <contact@aerial360.in>",
      Destinations: [user.email],
      RawMessage: {
        Data: userRawEmail
      }
    };

    // Send email to admin (without attachment)
    const adminParams = {
      Source: "Aerial360 Academy <contact@aerial360.in>",
      Destination: {
        ToAddresses: ["airboundfitness@gmail.com"]
      },
      Message: {
        Subject: {
          Data: `Class Rescheduled: ${classBody?.name} - ${user.name}`,
          Charset: "UTF-8"
        },
        Body: {
          Html: {
            Data: adminEmailContent,
            Charset: "UTF-8"
          }
        }
      }
    };

    // Send both emails
    await Promise.all([
      ses.sendRawEmail(userParams).promise(),
      ses.sendEmail(adminParams).promise()
    ]);

    console.log(`✅ Email sent to user: ${user.email}`);
    console.log(`✅ Notification sent to admin: airboundfitness@gmail.com`);

  } catch (error) {
    console.error(`❌ Error sending emails:`, error);
  }
};

// Helper function to create raw email with attachment
function createRawEmailWithAttachment(to, subject, htmlBody, icsContent) {
  const boundaryOuter = "MixedBoundary";
  const boundaryInner = "AltBoundary";
  const fromEmail = "airboundfitness@airbound.in";

  return [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundaryOuter}"`,
    ``,
    `--${boundaryOuter}`,
    `Content-Type: multipart/alternative; boundary="${boundaryInner}"`,
    ``,
    `--${boundaryInner}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    `Your booking has been confirmed. Please see the attached calendar event.`,
    ``,
    `--${boundaryInner}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlBody,
    ``,
    `--${boundaryInner}--`,
    ``,
    `--${boundaryOuter}`,
    `Content-Type: text/calendar; name="airbound-fitness-bookings.ics"`,
    `Content-Disposition: attachment; filename="airbound-fitness-bookings.ics"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(icsContent).toString("base64"),
    ``,
    `--${boundaryOuter}--`
  ].join("\n");
}

export { sendEmailToUser };