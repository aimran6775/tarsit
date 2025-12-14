# Test Accounts Documentation

This document contains all permanent test accounts used for automated testing in the Tarsit application.

> ⚠️ **IMPORTANT**: These accounts are for development and testing purposes only. Never use these credentials in production.

## Universal Test Password

All test accounts use the same password for simplicity:

```
Password: Tarsit1234!
```

Password Requirements:
- 8+ characters ✓
- Uppercase letter ✓
- Lowercase letter ✓
- Number ✓
- Special character ✓
- Does not contain common words like "password" ✓

---

## Test Accounts

### 🔐 Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@tarsit.com` |
| Password | `Tarsit1234!` |
| Role | `ADMIN` |
| First Name | Admin |
| Last Name | Tarsit |
| Verified | Yes |

**Capabilities:**
- Full administrative access
- Can manage all users, businesses, categories
- Can approve/reject verification requests
- Access to analytics and system settings

---

### 👤 Customer Test Account

| Field | Value |
|-------|-------|
| Email | `testcustomer@tarsit.com` |
| Password | `Tarsit1234!` |
| Role | `CUSTOMER` |
| First Name | Test |
| Last Name | Customer |
| Verified | Yes |

**Capabilities:**
- Browse businesses
- Leave reviews
- Book appointments
- Send messages to businesses
- Add businesses to favorites

---

### 🏢 Business Owner Test Account

| Field | Value |
|-------|-------|
| Email | `testowner@tarsit.com` |
| Password | `Tarsit1234!` |
| Role | `BUSINESS_OWNER` |
| First Name | Test |
| Last Name | Owner |
| Phone | +14155550001 |
| Verified | Yes |

**Capabilities:**
- Manage their own business
- Respond to reviews
- Manage appointments
- Update business information
- View business analytics

**Associated Test Business:**
- Name: `Test Business Tarsit`
- Slug: `test-business-tarsit`
- Category: Electronics Repair
- Location: 1 Test Street, San Francisco, CA 94102
- Phone: +14155550001
- Status: Verified

---

## Sample Accounts (Additional)

These accounts are created for realistic test data. They also use the password `Tarsit1234!`:

### Business Owners
| Email | First Name | Last Name |
|-------|------------|-----------|
| owner1@example.com | Business | Owner 1 |
| owner2@example.com | Business | Owner 2 |
| owner3@example.com | Business | Owner 3 |
| owner4@example.com | Business | Owner 4 |

### Customers
| Email | First Name | Last Name |
|-------|------------|-----------|
| customer1@example.com | Customer | 1 |
| customer2@example.com | Customer | 2 |
| customer3@example.com | Customer | 3 |

---

## API Authentication

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@tarsit.com",
  "password": "Tarsit1234!"
}
```

### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@tarsit.com",
    "firstName": "Admin",
    "lastName": "Tarsit",
    "role": "ADMIN"
  }
}
```

### Using the Token
```bash
Authorization: Bearer <accessToken>
```

---

## Seeding the Database

To create/reset these accounts in the database:

```bash
cd apps/api
pnpm prisma db seed
```

This will:
1. Clear all existing data
2. Create all test accounts
3. Create sample categories, businesses, reviews, etc.

---

## Test Data Summary

After seeding, the database will contain:

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 10 | 1 admin, 5 business owners, 4 customers |
| Categories | 10 | Electronics, Automotive, Beauty, etc. |
| Businesses | 6 | 1 test business + 5 sample businesses |
| Services | ~18 | Various services across businesses |
| Reviews | 15 | Sample reviews on businesses |
| Favorites | 8 | Sample favorites |

---

## Quick Reference

```javascript
// Admin login
const admin = {
  email: 'admin@tarsit.com',
  password: 'Tarsit1234!'
};

// Customer login
const customer = {
  email: 'testcustomer@tarsit.com',
  password: 'Tarsit1234!'
};

// Business owner login
const businessOwner = {
  email: 'testowner@tarsit.com',
  password: 'Tarsit1234!'
};
```
