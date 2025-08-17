# Vendor Dashboard - Deployment Guide

## Quick Deployment

### 1. Environment Setup
Copy the environment variables from `env.example` to your deployment platform:

```bash
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=vendor_dashboard
DB_PORT=3306

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here

# Application Configuration
NODE_ENV=production
```

### 2. Database Setup
Run the database setup script:
```sql
-- Execute database_setup.sql on your MySQL server
```

### 3. Build and Deploy

#### Option A: Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Option B: Manual Deployment
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run production
```

#### Option C: Docker
```bash
# Build Docker image
docker build -t vendor-dashboard .

# Run container
docker run -p 3000:3000 --env-file .env vendor-dashboard
```

## Deployment Platforms

### Vercel
- **Recommended for Next.js apps**
- Automatic deployments
- Built-in environment variable management
- Free tier available

### Netlify
- Good for static sites
- Requires build command: `npm run build`
- Publish directory: `.next`

### Railway
- Full-stack platform
- Database included
- Easy environment variable setup

### DigitalOcean App Platform
- Scalable deployment
- Database integration
- SSL certificates included

## Environment Variables

### Required Variables
- `DB_HOST`: Database server hostname
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `SMTP_USER`: Email service username
- `SMTP_PASS`: Email service password
- `NEXTAUTH_SECRET`: Random string for session security

### Optional Variables
- `DB_PORT`: Database port (default: 3306)
- `SMTP_HOST`: SMTP server (default: smtp.gmail.com)
- `SMTP_PORT`: SMTP port (default: 587)
- `NEXTAUTH_URL`: Your application URL

## Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use HTTPS in production
- [ ] Configure database with proper permissions
- [ ] Set up email service with app passwords
- [ ] Enable security headers (already configured)
- [ ] Regular database backups

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
npm run clean
npm run build
```

### Database Connection Issues
- Verify database credentials
- Check network connectivity
- Ensure database server is running

### Email Issues
- Verify SMTP credentials
- Check app password for Gmail
- Test email configuration

## Performance Optimization

- Images are optimized automatically
- CSS is minified in production
- JavaScript is bundled and minified
- Database queries are optimized
- Caching headers are configured

## Monitoring

- Application logs are available in deployment platform
- Database performance monitoring recommended
- Email delivery monitoring
- Error tracking (consider Sentry integration)

## Support

For deployment issues:
1. Check environment variables
2. Verify database connectivity
3. Review application logs
4. Test email configuration
