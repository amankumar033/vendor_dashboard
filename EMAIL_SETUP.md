# Email Configuration Setup

To enable email notifications for service requests, you need to configure SMTP settings in your `.env.local` file.

## Required Environment Variables

Add the following variables to your `.env.local` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

## Email Provider Setup

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Use the generated app password as `SMTP_PASS`

### Outlook/Hotmail Setup
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
SMTP_FROM=your_email@outlook.com
```

### Custom SMTP Server
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
```

## Testing Email Configuration

After setting up the environment variables, you can test the email functionality by:

1. Creating a test service request using the `create_test_service_request.js` script
2. Going to the Service Requests page in the dashboard
3. Accepting or rejecting a service request
4. Checking if the email is sent to the customer

## Email Templates

The system sends two types of emails:

### Service Request Accepted
- Subject: "Service Request Accepted"
- Content: Includes service details, customer information, and confirmation message

### Service Request Rejected
- Subject: "Service Request Rejected"
- Content: Includes service details and rejection message with suggestions

## Troubleshooting

If emails are not being sent:

1. Check your SMTP credentials in `.env.local`
2. Verify your email provider's SMTP settings
3. Check the server logs for email-related errors
4. Ensure the `user_email` field is properly set in the notification metadata

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of regular passwords for Gmail
- Consider using environment-specific email configurations for production





