# TARS AI Agent Documentation

**TARS** (named after the AI robot from Interstellar) is the AI assistant for Tarsit platform.

## Overview

TARS is designed to help both customers and businesses with:
- Finding businesses and services
- Booking appointments
- Managing business profiles
- Answering questions
- Platform navigation

### Personality
- Humor setting: 75%
- Honesty: 95%
- Efficient, helpful, and occasionally witty

## Architecture

### Backend (`apps/api/src/tars/`)

```
tars/
├── tars.module.ts          # NestJS module
├── tars.service.ts         # Core AI service with OpenAI
├── tars.controller.ts      # API endpoints
├── memory/
│   └── memory.service.ts   # Conversation memory
├── actions/
│   └── actions.service.ts  # Action execution & approval
└── prompts/
    └── system-prompt.ts    # AI personality & instructions
```

### Database Models (Prisma)

1. **TarsConversation** - Chat sessions
2. **TarsMessage** - Individual messages
3. **TarsMemory** - User/business memories
4. **TarsActionQueue** - Actions requiring approval
5. **TarsSettings** - Per-business TARS config

### Permission Levels

#### Direct Actions (TARS can do immediately):
- `search_businesses` - Find businesses
- `get_business_details` - View business info
- `get_business_hours` - Operating hours
- `get_business_reviews` - View reviews
- `check_availability` - Appointment slots
- `get_user_profile` - User info
- `update_own_profile` - Self profile updates
- `get_categories` - Category list
- `get_services` - Service list

#### Actions Requiring Admin Approval:
- `create_appointment` - Book on behalf of user
- `cancel_appointment` - Cancel bookings
- `modify_appointment` - Change appointments
- `update_business_info` - Modify business data
- `delete_review` - Remove reviews
- `issue_refund` - Process refunds
- `modify_user_data` - Change user data
- `bulk_update` - Bulk operations

## API Endpoints

### Chat
```
POST /api/tars/chat
Body: { message, sessionId?, context?, businessId? }
Response: { message, conversationId, suggestions?, actionRequired? }
```

### Admin Actions
```
GET  /api/tars/admin/actions/pending
POST /api/tars/admin/actions/:id/approve
POST /api/tars/admin/actions/:id/reject
POST /api/tars/admin/actions/bulk-review
GET  /api/tars/admin/actions/history
```

### Settings
```
GET  /api/tars/settings/:businessId
PUT  /api/tars/settings/:businessId
```

### Memory
```
POST /api/tars/memory
GET  /api/tars/memory
POST /api/tars/memory/forget
POST /api/tars/memory/clear
```

## Frontend Components

### TarsChat (`components/TarsChat.tsx`)
- Floating chat widget
- Embedded chat panel
- Message history
- Suggestions
- Action notifications

### TarsTab (`app/admin/components/TarsTab.tsx`)
- Admin approval dashboard
- Bulk approve/reject
- Action details viewer
- Status filtering

### Integration in HelpTab
- "Chat with TARS" tab
- Business context aware
- Real-time responses

## Environment Setup

Add to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## Database Migration

Run after updating schema:
```bash
cd apps/api
npx prisma migrate dev --name add_tars_models
npx prisma generate
```

## Usage Examples

### Customer Chat
```typescript
// Customer asking for help
const response = await fetch('/api/tars/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "Help me find a good restaurant nearby",
    context: "general"
  })
});
```

### Business Owner Chat
```typescript
// Business owner asking about their dashboard
const response = await fetch('/api/tars/chat', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    message: "How do I update my business hours?",
    context: "business",
    businessId: "uuid-here"
  })
});
```

### Admin Reviewing Actions
```typescript
// Approve action
await fetch(`/api/tars/admin/actions/${actionId}/approve`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}` }
});

// Bulk reject
await fetch('/api/tars/admin/actions/bulk-review', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: JSON.stringify({
    actionIds: ['id1', 'id2'],
    decision: 'reject',
    notes: 'Invalid requests'
  })
});
```

## TARS Quotes (from Interstellar)

- "What's your humor setting, TARS?" "75%."
- "Honesty, new setting: 95%"
- "Absolute honesty isn't always the most diplomatic..."
- "I have a cue light I can use when I'm joking, if you like."

---

Created for Tarsit Platform © 2024
