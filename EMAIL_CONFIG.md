# Email Configuration Setup

## Quick Setup

Create a `.env.local` file in your project root with these settings:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

## Gmail Setup Steps

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

## Alternative Email Providers

**Outlook:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
SMTP_FROM=your_email@outlook.com
```

**Custom SMTP:**
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=your_email@domain.com
```

## Test After Setup

1. Restart your development server
2. Accept/reject a service request
3. Check if emails are sent successfully



