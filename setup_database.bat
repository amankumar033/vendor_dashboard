@echo off
echo Setting up Vendor Dashboard Database...
echo.

echo Step 1: Starting MySQL service...
net start mysql

echo.
echo Step 2: Creating database and tables...
mysql -u root -p < database_setup.sql

echo.
echo Step 3: Database setup complete!
echo.
echo You can now login with:
echo Email: vendor@example.com
echo Password: password123
echo.
pause 