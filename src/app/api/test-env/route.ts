import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
    smtp_from: process.env.SMTP_FROM,
    db_host: process.env.DB_HOST,
    node_env: process.env.NODE_ENV
  });
}








