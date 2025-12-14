# Business Dashboard Enhancement Roadmap

## Overview
This document outlines a comprehensive 5-phase plan to enhance the Tarsit Business Dashboard, making it more powerful, user-friendly, and feature-complete.

---

## Phase 1: Feature Toggles & Visibility Settings ✅ (Priority: HIGH)

### Goal
Allow business owners to enable/disable features that appear on their public profile.

### Features
- [ ] **Appointments Toggle** - Enable/disable online booking
- [ ] **Messaging Toggle** - Enable/disable customer chat
- [ ] **Reviews Toggle** - Show/hide reviews section
- [ ] **Services Toggle** - Show/hide services list
- [ ] **Hours Toggle** - Show/hide business hours
- [ ] **Phone Toggle** - Show/hide phone number
- [ ] **Website Toggle** - Show/hide website link

### Implementation
- Enhanced `SettingsTab.tsx` with new "Profile Visibility" section
- Backend API to save visibility settings
- Frontend profile page respects these settings

### Files to Modify
- `apps/web/src/app/business/dashboard/components/SettingsTab.tsx`
- `apps/api/prisma/schema.prisma` (add visibility fields)
- `apps/web/src/app/business/[slug]/page.tsx` (respect settings)

---

## Phase 2: Enhanced Photo Management 📸 (Priority: HIGH)

### Goal
Provide a robust photo upload and gallery management system.

### Features
- [x] Upload multiple business photos
- [x] Upload cover image
- [x] Upload logo
- [ ] **Drag & Drop Upload** - Drag files to upload
- [ ] **Photo Reordering** - Drag to reorder gallery
- [ ] **Photo Captions** - Add descriptions to photos
- [ ] **Bulk Operations** - Select and delete multiple
- [ ] **Image Cropping** - Crop before upload
- [ ] **Upload Progress** - Show upload percentage

### Implementation
- Enhance `PhotosTab.tsx` with drag-drop and reordering
- Add image cropping modal
- Better upload progress indicators

### Files to Modify
- `apps/web/src/app/business/dashboard/components/PhotosTab.tsx`
- Add `react-dropzone` and `react-image-crop` packages

---

## Phase 3: Help & Support Center 🆘 (Priority: MEDIUM)

### Goal
Provide business owners easy access to Tarsit support and resources.

### Features
- [ ] **Help Tab** - New dashboard tab for support
- [ ] **Contact Form** - Direct message to Tarsit support
- [ ] **FAQ Section** - Common questions and answers
- [ ] **Video Tutorials** - Embedded how-to videos
- [ ] **Live Chat Widget** - Real-time support option
- [ ] **Ticket System** - Track support requests
- [ ] **Knowledge Base** - Searchable help articles

### Implementation
- New `HelpTab.tsx` component
- Support ticket API endpoints
- FAQ content management

### Files to Create
- `apps/web/src/app/business/dashboard/components/HelpTab.tsx`
- `apps/api/src/support/support.module.ts`
- `apps/api/src/support/support.controller.ts`
- `apps/api/src/support/support.service.ts`

---

## Phase 4: Advanced Analytics 📊 (Priority: MEDIUM)

### Goal
Give business owners deeper insights into their performance.

### Features
- [ ] **View Trends** - Daily/weekly/monthly views
- [ ] **Booking Analytics** - Appointment trends
- [ ] **Revenue Tracking** - Income from bookings
- [ ] **Customer Insights** - Repeat customer data
- [ ] **Review Analytics** - Rating trends over time
- [ ] **Comparison Charts** - This month vs last month
- [ ] **Export Reports** - Download as PDF/CSV
- [ ] **Peak Hours** - Busiest times visualization

### Implementation
- New `AnalyticsTab.tsx` component
- Chart.js or Recharts integration
- Analytics aggregation API

### Files to Create
- `apps/web/src/app/business/dashboard/components/AnalyticsTab.tsx`
- `apps/api/src/analytics/analytics.module.ts`

---

## Phase 5: Communication Hub 💬 (Priority: MEDIUM)

### Goal
Centralize all customer communication in one place.

### Features
- [ ] **Unified Inbox** - All messages in one view
- [ ] **Quick Replies** - Saved response templates
- [ ] **Auto-Responses** - Away messages
- [ ] **Message Tagging** - Organize conversations
- [ ] **Customer Notes** - Internal notes on customers
- [ ] **Bulk Messaging** - Send updates to all customers
- [ ] **SMS Notifications** - Text message alerts
- [ ] **Email Integration** - Reply via email

### Implementation
- Enhance `BusinessMessagesTab.tsx`
- Add template system
- Notification preferences

### Files to Modify
- `apps/web/src/app/business/dashboard/components/BusinessMessagesTab.tsx`
- Add notification service integration

---

## Implementation Timeline

| Phase | Priority | Estimated Time | Status |
|-------|----------|----------------|--------|
| Phase 1: Feature Toggles | HIGH | 2-3 hours | ✅ Completed |
| Phase 2: Photo Management | HIGH | 3-4 hours | ✅ Completed |
| Phase 3: Help & Support | MEDIUM | 4-5 hours | ✅ Completed |
| Phase 4: Advanced Analytics | MEDIUM | 5-6 hours | ⏳ Pending |
| Phase 5: Communication Hub | MEDIUM | 4-5 hours | ⏳ Pending |

---

## Quick Wins (Can be done immediately)

1. ✅ Feature toggles in Settings (Phase 1)
2. ✅ Photo upload enhancement (existing but needs polish)
3. ✅ Help/Support tab with contact form
4. ✅ FAQ section with common questions

---

## Database Schema Changes Needed

```prisma
// Add to Business model
model Business {
  // ... existing fields ...
  
  // Feature Toggles (Profile Visibility)
  showPhone           Boolean @default(true)
  showEmail           Boolean @default(true)
  showWebsite         Boolean @default(true)
  showHours           Boolean @default(true)
  showServices        Boolean @default(true)
  showReviews         Boolean @default(true)
  messagesEnabled     Boolean @default(true)
  
  // Help & Support
  supportTickets      SupportTicket[]
}

model SupportTicket {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id])
  subject     String
  message     String   @db.Text
  status      String   @default("open") // open, in_progress, resolved, closed
  priority    String   @default("normal") // low, normal, high, urgent
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  responses   SupportResponse[]
}

model SupportResponse {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id])
  message     String        @db.Text
  fromSupport Boolean       @default(false)
  createdAt   DateTime      @default(now())
}
```

---

## Notes

- All changes should maintain backward compatibility
- Mobile responsiveness is critical
- Dark theme must be maintained throughout
- Loading states and error handling for all actions
- Toast notifications for user feedback
