GitHub Copilot: # Complete Backend Requirements for QuickDesk

## 🗄️ Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
role ENUM('End User', 'Support Agent', 'Admin') DEFAULT 'End User',
status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
email_verified_at TIMESTAMP NULL,
profile_picture VARCHAR(500) NULL,
phone VARCHAR(20) NULL,
department VARCHAR(100) NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

INDEX idx_email (email),
INDEX idx_role (role),
INDEX idx_status (status)
);
```

### 2. Categories Table

```sql
CREATE TABLE categories (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL UNIQUE,
description TEXT NOT NULL,
color VARCHAR(7) DEFAULT '#007bff',
icon VARCHAR(10) DEFAULT '📂',
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

INDEX idx_active (is_active),
INDEX idx_name (name)
);
```

### 3. Tags Table

```sql
CREATE TABLE tags (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50) NOT NULL,
category_id BIGINT NOT NULL,
color VARCHAR(7) DEFAULT '#6c757d',
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
UNIQUE KEY unique_tag_per_category (name, category_id),
INDEX idx_category (category_id),
INDEX idx_active (is_active)
);
```

### 4. Tickets Table

```sql
CREATE TABLE tickets (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
category_id BIGINT NOT NULL,
priority ENUM('low', 'medium', high') DEFAULT 'medium',
status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
is_urgent BOOLEAN DEFAULT FALSE,
author_id BIGINT NOT NULL,
assigned_to BIGINT NULL,
assigned_at TIMESTAMP NULL,
resolved_at TIMESTAMP NULL,
closed_at TIMESTAMP NULL,
last_reply_at TIMESTAMP NULL,
reply_count INT DEFAULT 0,
internal_notes_count INT DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
FOREIGN KEY (category_id) REFERENCES categories(id),

INDEX idx_status (status),
INDEX idx_priority (priority),
INDEX idx_author (author_id),
INDEX idx_assigned (assigned_to),
INDEX idx_category (category_id),
INDEX idx_urgent (is_urgent),
INDEX idx_created (created_at),
INDEX idx_updated (updated_at)
);
```

### 5. Ticket Replies Table

```sql
CREATE TABLE ticket_replies (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
ticket_id BIGINT NOT NULL,
user_id BIGINT NOT NULL,
content TEXT NOT NULL,
reply_type ENUM('public', 'internal_note') DEFAULT 'public',
is_solution BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

INDEX idx_ticket (ticket_id),
INDEX idx_user (user_id),
INDEX idx_type (reply_type),
INDEX idx_created (created_at)
);
```

### 6. Ticket Tags (Many-to-Many)

```sql
CREATE TABLE ticket_tags (
ticket_id BIGINT NOT NULL,
tag_id BIGINT NOT NULL,

PRIMARY KEY (ticket_id, tag_id),
FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 7. Attachments Table

```sql
CREATE TABLE attachments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
ticket_id BIGINT NOT NULL,
reply_id BIGINT NULL,
original_name VARCHAR(255) NOT NULL,
stored_name VARCHAR(255) NOT NULL,
file_path VARCHAR(500) NOT NULL,
file_size BIGINT NOT NULL,
mime_type VARCHAR(100) NOT NULL,
uploaded_by BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
FOREIGN KEY (reply_id) REFERENCES ticket_replies(id) ON DELETE CASCADE,
FOREIGN KEY (uploaded_by) REFERENCES users(id),

INDEX idx_ticket (ticket_id),
INDEX idx_reply (reply_id),
INDEX idx_uploader (uploaded_by)
);
```

### 8. Role Upgrade Requests Table

```sql
CREATE TABLE role_upgrade_requests (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
user_id BIGINT NOT NULL,
current_role ENUM('End User', 'Support Agent', 'Admin') NOT NULL,
requested_role ENUM('End User', 'Support Agent', 'Admin') NOT NULL,
reason TEXT NOT NULL,
status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
reviewed_by BIGINT NULL,
reviewed_at TIMESTAMP NULL,
admin_notes TEXT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

INDEX idx_user (user_id),
INDEX idx_status (status),
INDEX idx_created (created_at)
);
```

### 9. Notifications Table

```sql
CREATE TABLE notifications (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
user_id BIGINT NOT NULL,
type ENUM('ticket', 'system', 'assignment', 'mention', 'upgrade', 'reminder') NOT NULL,
title VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
is_read BOOLEAN DEFAULT FALSE,
is_urgent BOOLEAN DEFAULT FALSE,
action_url VARCHAR(500) NULL,
action_text VARCHAR(100) NULL,
sender_id BIGINT NULL,
ticket_id BIGINT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,

INDEX idx_user (user_id),
INDEX idx_read (is_read),
INDEX idx_urgent (is_urgent),
INDEX idx_type (type),
INDEX idx_created (created_at)
);
```

### 10. Sessions Table (for JWT alternative)

```sql
CREATE TABLE user_sessions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
user_id BIGINT NOT NULL,
token VARCHAR(255) NOT NULL UNIQUE,
ip_address VARCHAR(45) NULL,
user_agent TEXT NULL,
expires_at TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

INDEX idx_token (token),
INDEX idx_user (user_id),
INDEX idx_expires (expires_at)
);
```

---

## 🔗 API Endpoints

### 🔐 Authentication Routes

#### POST /api/auth/register

```json
Request Body:
{
"name": "John Doe",
"email": "john@example.com",
"password": "password123",
"phone": "123-456-7890",
"department": "IT"
}

Response:
{
"success": true,
"message": "User registered successfully",
"user": {
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"role": "End User"
},
"token": "jwt_token_here"
}
```

#### POST /api/auth/login

```json
Request Body:
{
"email": "john@example.com",
"password": "password123"
}

Response:
{
"success": true,
"user": {
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"role": "End User"
},
"token": "jwt_token_here"
}
```

#### POST /api/auth/logout

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"message": "Logged out successfully"
}
```

#### GET /api/auth/me

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"user": {
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"role": "End User",
"profile_picture": null,
"phone": "123-456-7890"
}
}
```

#### POST /api/auth/forgot-password

```json
Request Body:
{
"email": "john@example.com"
}

Response:
{
"success": true,
"message": "Password reset email sent"
}
```

---

### 🎫 Ticket Management Routes

#### GET /api/tickets

```json
Query Parameters:
?page=1&limit=10&status=open&category=1&priority=high&assigned_to=me&search=database

Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"data": [
{
"id": 1,
"title": "Database connection issue",
"description": "Cannot connect to database",
"category": {
"id": 1,
"name": "Technical",
"color": "#007bff"
},
"priority": "high",
"status": "open",
"is_urgent": true,
"author": {
"id": 2,
"name": "Jane Smith",
"email": "jane@example.com"
},
"assigned_to": {
"id": 3,
"name": "Support Agent",
"email": "agent@example.com"
},
"reply_count": 3,
"created_at": "2025-01-30T10:00:00Z",
"updated_at": "2025-01-30T14:30:00Z"
}
],
"pagination": {
"current_page": 1,
"per_page": 10,
"total": 50,
"total_pages": 5
}
}
```

#### POST /api/tickets

```json
Headers: Authorization: Bearer {token}

Request Body:
{
"title": "Need help with API integration",
"description": "Having trouble integrating the payment API",
"category_id": 2,
"priority": "medium",
"is_urgent": false,
"tags": [1, 3, 5]
}

Response:
{
"success": true,
"message": "Ticket created successfully",
"ticket": {
"id": 123,
"title": "Need help with API integration",
"status": "open",
"created_at": "2025-01-30T15:00:00Z"
}
}
```

#### GET /api/tickets/{id}

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"ticket": {
"id": 1,
"title": "Database connection issue",
"description": "Cannot connect to database",
"category": {...},
"priority": "high",
"status": "open",
"author": {...},
"assigned_to": {...},
"tags": [...],
"created_at": "2025-01-30T10:00:00Z"
},
"replies": [
{
"id": 1,
"content": "I'm looking into this issue",
"reply_type": "public",
"user": {
"id": 3,
"name": "Support Agent"
},
"created_at": "2025-01-30T11:00:00Z"
}
],
"attachments": [...]
}
```

#### PUT /api/tickets/{id}

```json
Headers: Authorization: Bearer {token}

Request Body:
{
"title": "Updated title",
"description": "Updated description",
"priority": "high",
"status": "in_progress"
}

Response:
{
"success": true,
"message": "Ticket updated successfully",
"ticket": {...}
}
```

#### POST /api/tickets/{id}/replies

```json
Headers: Authorization: Bearer {token}

Request Body:
{
"content": "This is my reply to the ticket",
"reply_type": "public",
"is_solution": false
}

Response:
{
"success": true,
"message": "Reply added successfully",
"reply": {
"id": 5,
"content": "This is my reply to the ticket",
"created_at": "2025-01-30T16:00:00Z"
}
}
```

#### POST /api/tickets/{id}/assign

```json
Headers: Authorization: Bearer {token}
Permissions: Admin or Support Agent

Request Body:
{
"assigned_to": 3,
"notes": "Assigning to John for technical expertise"
}

Response:
{
"success": true,
"message": "Ticket assigned successfully"
}
```

#### POST /api/tickets/{id}/pickup

```json
Headers: Authorization: Bearer {token}
Permissions: Support Agent

Response:
{
"success": true,
"message": "Ticket picked up successfully"
}
```

---

### 👥 User Management Routes (Admin)

#### GET /api/admin/users

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Query Parameters:
?page=1&limit=10&role=End User&status=active&search=john

Response:
{
"success": true,
"users": [
{
"id": 1,
"name": "John Doe",
"email": "john@example.com",
"role": "End User",
"status": "active",
"tickets_created": 5,
"tickets_resolved": 0,
"created_at": "2025-01-15T10:00:00Z",
"last_login": "2025-01-30T09:00:00Z"
}
],
"pagination": {...}
}
```

#### PUT /api/admin/users/{id}/role

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"role": "Support Agent",
"notes": "Promoted due to excellent performance"
}

Response:
{
"success": true,
"message": "User role updated successfully"
}
```

#### PUT /api/admin/users/{id}/status

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"status": "inactive",
"reason": "Account violation"
}

Response:
{
"success": true,
"message": "User status updated successfully"
}
```

#### GET /api/admin/upgrade-requests

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Response:
{
"success": true,
"requests": [
{
"id": 1,
"user": {
"id": 5,
"name": "Jane Smith",
"email": "jane@example.com"
},
"current_role": "End User",
"requested_role": "Support Agent",
"reason": "I have 3 years of technical support experience",
"status": "pending",
"created_at": "2025-01-30T10:00:00Z"
}
]
}
```

#### POST /api/admin/upgrade-requests/{id}/approve

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"admin_notes": "Approved based on experience and interview"
}

Response:
{
"success": true,
"message": "Upgrade request approved successfully"
}
```

#### POST /api/admin/upgrade-requests/{id}/reject

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"admin_notes": "Need more experience before approval"
}

Response:
{
"success": true,
"message": "Upgrade request rejected"
}
```

---

### 📂 Category Management Routes

#### GET /api/admin/categories

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Response:
{
"success": true,
"categories": [
{
"id": 1,
"name": "Technical",
"description": "Technical support issues",
"color": "#007bff",
"icon": "🔧",
"is_active": true,
"ticket_count": 45,
"created_at": "2025-01-15T10:00:00Z"
}
]
}
```

#### POST /api/admin/categories

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"name": "Security",
"description": "Security related issues and vulnerabilities",
"color": "#dc3545",
"icon": "🔒"
}

Response:
{
"success": true,
"message": "Category created successfully",
"category": {...}
}
```

#### PUT /api/admin/categories/{id}

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Request Body:
{
"name": "Updated Security",
"description": "Updated description",
"color": "#28a745",
"icon": "🛡️"
}

Response:
{
"success": true,
"message": "Category updated successfully"
}
```

#### DELETE /api/admin/categories/{id}

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Response:
{
"success": true,
"message": "Category deleted successfully"
}
```

#### GET /api/admin/tags

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Response:
{
"success": true,
"tags": [
{
"id": 1,
"name": "urgent",
"category": {
"id": 1,
"name": "Technical"
},
"color": "#dc3545",
"usage_count": 23,
"is_active": true
}
]
}
```

---

### 🔔 Notification Routes

#### GET /api/notifications

```json
Headers: Authorization: Bearer {token}

Query Parameters:
?page=1&limit=10&type=ticket&is_read=false

Response:
{
"success": true,
"notifications": [
{
"id": 1,
"type": "ticket",
"title": "New reply on your ticket",
"message": "Sarah Johnson replied to your ticket #1234",
"is_read": false,
"is_urgent": false,
"action_url": "/ticket/1234",
"action_text": "View Ticket",
"sender": {
"id": 3,
"name": "Sarah Johnson"
},
"created_at": "2025-01-30T14:30:00Z"
}
],
"unread_count": 5,
"urgent_count": 2
}
```

#### PUT /api/notifications/{id}/read

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"message": "Notification marked as read"
}
```

#### POST /api/notifications/mark-all-read

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"message": "All notifications marked as read"
}
```

#### DELETE /api/notifications/{id}

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"message": "Notification deleted successfully"
}
```

---

### 📊 Dashboard & Analytics Routes

#### GET /api/dashboard/user

```json
Headers: Authorization: Bearer {token}

Response:
{
"success": true,
"data": {
"total_tickets": 12,
"open_tickets": 3,
"in_progress_tickets": 2,
"resolved_tickets": 7,
"recent_tickets": [...],
"unread_notifications": 5
}
}
```

#### GET /api/dashboard/staff

```json
Headers: Authorization: Bearer {token}
Permissions: Support Agent

Response:
{
"success": true,
"data": {
"assigned_tickets": 8,
"in_progress_tickets": 3,
"urgent_tickets": 2,
"available_tickets": 15,
"recent_activity": [...],
"performance_stats": {
"resolved_today": 5,
"avg_response_time": "2.5 hours",
"satisfaction_rating": 4.8
}
}
}
```

#### GET /api/dashboard/admin

```json
Headers: Authorization: Bearer {token}
Permissions: Admin

Response:
{
"success": true,
"data": {
"total_users": 245,
"total_agents": 12,
"total_tickets": 1847,
"open_tickets": 156,
"closed_tickets": 1691,
"pending_upgrades": 3,
"category_stats": [...],
"agent_performance": [...],
"recent_activity": [...]
}
}
```

---

### 📁 File Upload Routes

#### POST /api/tickets/{id}/attachments

```json
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
{
"file": [File],
"reply_id": 5 // optional, if attaching to specific reply
}

Response:
{
"success": true,
"message": "File uploaded successfully",
"attachment": {
"id": 1,
"original_name": "screenshot.png",
"file_size": 1024000,
"download_url": "/api/attachments/1/download"
}
}
```

#### GET /api/attachments/{id}/download

```json
Headers: Authorization: Bearer {token}

Response: File download
```

---

## 🔒 Middleware Requirements

### 1. Authentication Middleware

```javascript
// Verify JWT token and set user in request
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify token and set req.user
}
```

### 2. Role Authorization Middleware

```javascript
function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### 3. Rate Limiting

```javascript
// Limit requests per IP/user to prevent abuse
const rateLimit = require('express-rate-limit');
```

### 4. Input Validation

```javascript
// Validate and sanitize all inputs
const { body, validationResult } = require('express-validator');
```

---

## 📧 Background Jobs & Services

### 1. Email Service

```javascript
// Send notifications via email
- New ticket created
- Ticket status changed
- New reply added
- Role upgrade notifications
```

### 2. Notification Service

```javascript
// Create system notifications
- Real-time updates
- Push notifications
- In-app notifications
```

### 3. Analytics Service

```javascript
// Generate reports and statistics
- Ticket resolution times
- Agent performance metrics
- User activity reports
```

This complete backend structure will support all the features in your React frontend! 🚀
