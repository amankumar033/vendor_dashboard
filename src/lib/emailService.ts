import nodemailer from 'nodemailer';

// Email configuration
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'r0192399@gmail.com',
    pass: 'brmpnxyzenefyndb'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Email templates
export const emailTemplates = {
  serviceOrderAccepted: (data: any) => ({
    subject: 'Service Request Accepted',
    html: `
      <h2>Service Request Accepted</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>Your service request has been accepted by the vendor.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Service Details:</h3>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Category:</strong> ${data.serviceCategory}</p>
        <p><strong>Type:</strong> ${data.serviceType}</p>
        <p><strong>Base Price:</strong> ₹${data.basePrice}</p>
        <p><strong>Duration:</strong> ${data.durationMinutes} minutes</p>
        <p><strong>Requested Date:</strong> ${data.serviceDate}</p>
        <p><strong>Requested Time:</strong> ${data.serviceTime}</p>
        <p><strong>Service Address:</strong> ${data.serviceAddress}</p>
      </div>
      <p>The vendor will contact you shortly to confirm the final details and schedule.</p>
      <p>Thank you for choosing our services!</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  }),

  serviceOrderRejected: (data: any) => ({
    subject: 'Service Request Rejected',
    html: `
      <h2>Service Request Rejected</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>We regret to inform you that your service request has been rejected by the vendor.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Service Details:</h3>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Category:</strong> ${data.serviceCategory}</p>
        <p><strong>Type:</strong> ${data.serviceType}</p>
        <p><strong>Requested Date:</strong> ${data.serviceDate}</p>
        <p><strong>Requested Time:</strong> ${data.serviceTime}</p>
      </div>
      <p>Please try another service or vendor that better matches your requirements.</p>
      <p>We apologize for any inconvenience caused.</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  }),

  serviceStatusUpdate: (data: any) => ({
    subject: `Service Order Status Updated - ${data.newStatus.toUpperCase()}`,
    html: `
      <h2>Service Order Status Update</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>Your service order has been updated.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Previous Status:</strong> ${data.previousStatus.toUpperCase()}</p>
        <p><strong>New Status:</strong> ${data.newStatus.toUpperCase()}</p>
        <p><strong>Updated Date:</strong> ${data.updatedDate}</p>
        <p><strong>Service Date:</strong> ${data.serviceDate}</p>
        <p><strong>Service Time:</strong> ${data.serviceTime}</p>
        <p><strong>Service Address:</strong> ${data.serviceAddress}</p>
      </div>
      ${data.statusMessage}
      <p>Thank you for choosing our services!</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  }),

  paymentStatusUpdate: (data: any) => ({
    subject: `Payment Status Updated - ${data.newPaymentStatus.toUpperCase()}`,
    html: `
      <h2>Payment Status Update</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>Your payment status has been updated.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Payment Details:</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Previous Payment Status:</strong> ${data.previousPaymentStatus.toUpperCase()}</p>
        <p><strong>New Payment Status:</strong> ${data.newPaymentStatus.toUpperCase()}</p>
        <p><strong>Amount:</strong> ₹${data.amount}</p>
        <p><strong>Updated Date:</strong> ${data.updatedDate}</p>
      </div>
      ${data.paymentMessage}
      <p>Thank you for choosing our services!</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  }),

  serviceCancelled: (data: any) => ({
    subject: 'Service Cancelled',
    html: `
      <h2>Service Cancelled</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>Your service has been cancelled.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Service Details:</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Service Date:</strong> ${data.serviceDate}</p>
        <p><strong>Service Time:</strong> ${data.serviceTime}</p>
        <p><strong>Cancelled Date:</strong> ${data.cancelledDate}</p>
      </div>
      <p>If you have any questions, please contact us.</p>
      <p>You may be eligible for a refund depending on our cancellation policy.</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  }),

  serviceCompleted: (data: any) => ({
    subject: 'Service Completed',
    html: `
      <h2>Service Completed</h2>
      <p>Dear ${data.customerName || 'Customer'},</p>
      <p>Your service has been completed successfully.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Service Details:</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Service Date:</strong> ${data.serviceDate}</p>
        <p><strong>Service Time:</strong> ${data.serviceTime}</p>
        <p><strong>Completed Date:</strong> ${data.completedDate}</p>
      </div>
      <p>Thank you for choosing our services! We hope you had a great experience.</p>
      <p>Please consider leaving a review to help us improve our services.</p>
      <p>Best regards,<br>Your Service Team</p>
    `
  })
};

// Status-specific messages
export const getStatusMessage = (status: string) => {
  switch (status) {
    case 'scheduled':
      return `
        <p>Your service has been scheduled. Please be ready at the specified time and location.</p>
        <p>The vendor will contact you shortly to confirm the final details.</p>
      `;
    case 'cancelled':
      return `
        <p>Your service has been cancelled. If you have any questions, please contact us.</p>
        <p>You may be eligible for a refund depending on our cancellation policy.</p>
      `;
    case 'rejected':
      return `
        <p>Your service request has been rejected. Please contact us for more information.</p>
        <p>You may try booking with a different vendor or service.</p>
      `;
    case 'refunded':
      return `
        <p>Your payment has been refunded. Please allow 3-5 business days for the refund to appear in your account.</p>
        <p>If you have any questions about the refund, please contact our support team.</p>
      `;
    case 'completed':
      return `
        <p>Your service has been completed successfully. Thank you for choosing our services!</p>
        <p>Please consider leaving a review to help us improve our services.</p>
      `;
    default:
      return `
        <p>Your service order status has been updated. Please check your dashboard for more details.</p>
      `;
  }
};

// Payment-specific messages
export const getPaymentMessage = (paymentStatus: string) => {
  switch (paymentStatus) {
    case 'paid':
      return `
        <p>Your payment has been successfully processed. Thank you for your payment!</p>
        <p>Your service will be scheduled as requested.</p>
      `;
    case 'failed':
      return `
        <p>Your payment has failed. Please try again or contact our support team for assistance.</p>
        <p>You can retry the payment from your dashboard.</p>
      `;
    case 'refunded':
      return `
        <p>Your payment has been refunded. Please allow 3-5 business days for the refund to appear in your account.</p>
        <p>If you have any questions about the refund, please contact our support team.</p>
      `;
    default:
      return `
        <p>Your payment status has been updated. Please check your dashboard for more details.</p>
      `;
  }
};

// Main email sending function
export async function sendEmail(to: string, subject: string, htmlBody: string) {
  try {
    console.log('📧 Attempting to send email to:', to);
    
    const mailOptions = {
      from: 'r0192399@gmail.com',
      to: to,
      subject: subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Convenience functions for specific email types
export async function sendServiceOrderAcceptedEmail(customerEmail: string, data: any) {
  const template = emailTemplates.serviceOrderAccepted(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendServiceOrderRejectedEmail(customerEmail: string, data: any) {
  const template = emailTemplates.serviceOrderRejected(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendServiceStatusUpdateEmail(customerEmail: string, data: any) {
  const template = emailTemplates.serviceStatusUpdate(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendPaymentStatusUpdateEmail(customerEmail: string, data: any) {
  const template = emailTemplates.paymentStatusUpdate(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendServiceCancelledEmail(customerEmail: string, data: any) {
  const template = emailTemplates.serviceCancelled(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

export async function sendServiceCompletedEmail(customerEmail: string, data: any) {
  const template = emailTemplates.serviceCompleted(data);
  await sendEmail(customerEmail, template.subject, template.html);
}

