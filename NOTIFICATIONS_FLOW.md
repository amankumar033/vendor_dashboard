# Notifications Flow Implementation

## Overview
Complete notifications flow for service order requests with accept/reject functionality.

## Key Features
1. **Service Order Notifications**: `service_order_created`, `service_order_accepted`, `service_order_rejected`
2. **Action Buttons**: Accept/Reject buttons for pending service requests
3. **Status Updates**: Automatic status changes in service_orders table
4. **Email Notifications**: Customer emails on accept/reject
5. **Edit Restrictions**: Rejected orders cannot be edited

## Status Options
- Service: pending, scheduled, cancelled, rejected, refunded
- Payment: pending, paid, failed, refunded

## Status Flow
- **Accept Action**: Changes status from `pending` to `scheduled`
- **Reject Action**: Changes status from `pending` to `rejected`
- **Manual Updates**: Can change between the five allowed statuses

## Components Updated
- NotificationBell: Action buttons, message/description display
- NotificationsManagement: Full notification handling
- ServiceOrdersManagement: Edit restrictions, new status options
- Service Requests API: Accept/reject logic, email sending

## Testing
Run `node create_test_service_request.js` to create test data.
