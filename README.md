# Vendor Dashboard

A comprehensive vendor management system built with Next.js, TypeScript, and MySQL.

## Features

- 🔐 Secure authentication with password hashing
- 📊 Dashboard with analytics and overview
- 🛠️ Service management
- 📦 Order management
- 👤 Profile management
- 📱 Responsive design

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up MySQL Database

**Option A: Install MySQL Server**
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Note down your root password

**Option B: Use Docker (Recommended for development)**
```bash
docker run --name mysql-vendor-dashboard -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=vendor_dashboard -p 3306:3306 -d mysql:8.0
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vendor_dashboard
DB_PORT=3306

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Set up Database Schema

Run the database setup script:

**Windows (PowerShell):**
```powershell
.\setup_database.ps1
```

**Windows (Command Prompt):**
```cmd
setup_database.bat
```

**Manual Setup:**
```bash
mysql -u root -p < database_setup.sql
```

### 5. Start Development Server

```bash
npm run dev
```

## Default Login Credentials

After setting up the database, you can login with:

- **Email:** `vendor@example.com`
- **Password:** `password123`

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   └── globals.css     # Global styles
├── components/         # React components
├── contexts/          # React contexts
└── lib/               # Utility functions
```

## API Endpoints

- `POST /api/auth/login` - Vendor authentication
- `GET /api/orders` - Get vendor orders
- `POST /api/orders/[id]` - Update order status
- `GET /api/services` - Get vendor services
- `POST /api/services` - Create new service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service
- `GET /api/profile` - Get vendor profile
- `PUT /api/profile` - Update vendor profile

## Database Schema

The application uses the following main tables:

- **Vendors** - Vendor information and authentication
- **Services** - Services offered by vendors
- **ServiceOrders** - Customer orders for services

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues

1. Ensure MySQL service is running
2. Check your `.env.local` configuration
3. Verify database credentials
4. Make sure the database exists

### Login Issues

1. Ensure the database is properly set up
2. Check that the vendor data exists in the database
3. Verify the password hash in the database

## License

MIT License
