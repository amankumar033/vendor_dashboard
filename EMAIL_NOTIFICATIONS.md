# Email Notification System

## Overview
The vendor dashboard now includes a comprehensive email notification system that ensures customers/users receive timely updates about their service orders. Emails are sent automatically for every action related to service orders.

## Email Triggers

### 1. Service Request Actions (Accept/Reject)
**Location:** `src/app/api/service-requests/route.ts`

**Triggers:**
- When vendor accepts a service request
- When vendor rejects a service request

**Email Content:**
- Service details (name, category, type, price, duration)
- Requested date and time
- Service address
- Action-specific message (acceptance confirmation or rejection explanation)

### 2. Service Order Status Updates
**Location:** `src/app/api/service-orders/[id]/route.ts`

**Triggers:**
- When service status changes (pending → scheduled, cancelled, rejected, refunded)
- When payment status changes (pending → paid, failed, refunded)

**Email Content:**
- Order ID and service details
- Previous and new status
- Service date, time, and address
- Status-specific instructions and next steps

### 3. Order Status Updates (Legacy API)
**Location:** `src/app/api/orders/[id]/route.ts`

**Triggers:**
- When order status is updated through the legacy orders API

**Email Content:**
- Order details and status change information
- Service scheduling information
- Cancellation/refund policies

## Email Templates

### Service Order Accepted
```
Subject: Service Request Accepted
Content:
- Service details (name, category, type, price, duration)
- Requested date and time
- Service address
- Confirmation that vendor will contact customer
```

### Service Order Rejected
```
Subject: Service Request Rejected
Content:
- Service details
- Rejection explanation
- Suggestion to try other services/vendors
- Apology for inconvenience
```

### Service Status Update
```
Subject: Service Order Status Updated - [STATUS]
Content:
- Order ID and service details
- Previous and new status
- Status-specific instructions
- Service date, time, and address
```

### Payment Status Update
```
Subject: Payment Status Updated - [STATUS]
Content:
- Order ID and service details
- Previous and new payment status
- Amount and payment method
- Payment-specific instructions
```

### Service Cancelled
```
Subject: Service Cancelled
Content:
- Order details
- Cancellation information
- Refund policy information
```

### Service Completed
```
Subject: Service Completed
Content:
- Order details
- Completion confirmation
- Request for review
```

## Email Configuration

### SMTP Settings
```javascript
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'r0192399@gmail.com',
    pass: 'brmpnxyzenefyndb'
  }
};
```

### Email Service Location
**File:** `src/lib/emailService.ts`

**Features:**
- Centralized email templates
- Consistent formatting
- Error handling
- Logging for debugging

## Status-Specific Messages

### Service Status Messages
- **Scheduled:** Confirmation and preparation instructions
- **Cancelled:** Cancellation notice and refund information
- **Rejected:** Rejection explanation and alternatives
- **Refunded:** Refund confirmation and timeline
- **Completed:** Completion confirmation and review request

### Payment Status Messages
- **Paid:** Payment confirmation and scheduling information
- **Failed:** Failure notice and retry instructions
- **Refunded:** Refund confirmation and support contact

## Error Handling

### Email Failures
- Email sending errors don't fail the main API request
- Errors are logged for debugging
- Graceful degradation ensures system stability

### Fallback Email
- If customer email is not available, uses fallback email
- Logs warning when fallback is used

## Testing

### Email Testing
1. Create a test service order
2. Perform various actions (accept, reject, update status)
3. Check email delivery
4. Verify email content and formatting

### Debug Logging
All email operations include console logging:
- `📧 Attempting to send email to: [email]`
- `✅ Email sent successfully to: [email]`
- `❌ Error sending email: [error]`

## Future Enhancements

### Planned Features
1. **Email Preferences:** Allow customers to choose notification types
2. **SMS Notifications:** Add SMS support for critical updates
3. **Email Templates:** Customizable email templates
4. **Bulk Notifications:** Support for bulk email sending
5. **Email Analytics:** Track email open rates and engagement

### Configuration Options
1. **Environment Variables:** Move SMTP settings to environment variables
2. **Template Customization:** Allow vendor-specific email templates
3. **Localization:** Support for multiple languages
4. **Email Scheduling:** Support for delayed email sending

## Security Considerations

### Email Security
- SMTP credentials are hardcoded (should be moved to environment variables)
- Email content is sanitized to prevent injection attacks
- No sensitive information is included in emails

### Privacy
- Customer emails are only used for order notifications
- No marketing emails are sent without consent
- Email addresses are not shared with third parties

## Monitoring and Maintenance

### Logging
- All email operations are logged
- Failed email attempts are tracked
- Email delivery status is monitored

### Maintenance
- Regular review of email templates
- Update SMTP credentials as needed
- Monitor email delivery rates
- Handle email bounces and failures

## Support

### Troubleshooting
1. **Email not received:** Check spam folder, verify email address
2. **Email formatting issues:** Review HTML template
3. **SMTP errors:** Verify SMTP credentials and settings
4. **Missing emails:** Check application logs for errors

### Contact
For email system issues, check:
1. Application logs for error messages
2. SMTP server status
3. Email template syntax
4. Customer email address validity

