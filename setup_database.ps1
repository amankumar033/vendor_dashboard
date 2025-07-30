Write-Host "Setting up Vendor Dashboard Database..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Starting MySQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name "MySQL*" -ErrorAction Stop
    Write-Host "MySQL service started successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error starting MySQL service. Please ensure MySQL is installed." -ForegroundColor Red
    Write-Host "You can download MySQL from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating database and tables..." -ForegroundColor Yellow
try {
    mysql -u root -p < database_setup.sql
    Write-Host "Database setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error setting up database. Please check your MySQL installation." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now login with:" -ForegroundColor Cyan
Write-Host "Email: vendor@example.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 