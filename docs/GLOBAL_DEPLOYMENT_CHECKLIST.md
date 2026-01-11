# 🌍 Tarsit Global Deployment Checklist

## Pre-Deployment Verification

### Database
- [ ] Run Prisma migrations: `pnpm prisma:migrate`
- [ ] Seed regions data: `pnpm prisma:seed`
- [ ] Verify all 11 regions exist in database
- [ ] Verify all 7 currencies with exchange rates
- [ ] Assign existing businesses to regions (default: US)

### Environment Variables

**Backend (Railway/API):**
```env
# Required - Already exists
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...

# New - Global Features
# No new env vars required - all config is in database
```

**Frontend (Vercel/Web):**
```env
# Required - Already exists
NEXT_PUBLIC_API_URL=https://api-production-445e.up.railway.app/api

# No new env vars required
```

---

## Feature Checklist

### Phase 1-2: Regions & Currencies ✅
- [x] Region table with 11 regions
- [x] Currency table with 7 currencies
- [x] Region-Currency relationship
- [x] GET /regions endpoint
- [x] GET /regions/:code endpoint
- [x] GET /regions/detect endpoint
- [x] GET /currencies endpoint
- [x] GET /currencies/convert endpoint

### Phase 3: User Region Detection ✅
- [x] IP-based region detection (ip-api.com)
- [x] User preferred region in profile
- [x] Region selector component
- [x] LocalStorage persistence (tarsit-region)

### Phase 4: Business Region Assignment ✅
- [x] Business.regionId field
- [x] Region auto-assignment based on country
- [x] Business region selector in dashboard

### Phase 5: Currency System ✅
- [x] Service prices with currency
- [x] Currency conversion API
- [x] Price display component
- [x] useCurrency hook

### Phase 6: AI Translation ✅
- [x] TranslationService with OpenAI
- [x] Translation caching
- [x] POST /translations/translate endpoint
- [x] POST /translations/detect endpoint
- [x] useTranslation hook

### Phase 7: Frontend i18n ✅
- [x] Translation files (en, ar, ur)
- [x] LanguageProvider context
- [x] LanguageSwitcher component
- [x] RTL support (CSS + layout)
- [x] useLanguage hook

### Phase 8: API Regionalization ✅
- [x] Region middleware (X-Region-Code header)
- [x] Region decorators (@RegionCode, etc.)
- [x] Search results filtered by region
- [x] GET /regions/:code/featured
- [x] GET /regions/:code/popular-categories
- [x] GET /regions/:code/stats
- [x] Frontend API client sends region headers

### Phase 9: Tars AI Localization ✅
- [x] Language parameter in chat request
- [x] Persona prompts with language instructions
- [x] Arabic, Urdu, Hindi, Spanish, French, German support
- [x] GlobalTarsWidget sends language

---

## Testing Checklist

### API Tests
```bash
cd apps/api
npx ts-node scripts/test-global-features.ts
```

- [ ] All region endpoints return data
- [ ] Currency conversion works
- [ ] Search respects X-Region-Code header
- [ ] Tars responds in requested language
- [ ] Translation API works

### Frontend Tests
- [ ] Region selector shows all regions
- [ ] Language switcher changes UI language
- [ ] RTL layout works for Arabic/Urdu
- [ ] Prices display in selected currency
- [ ] Tars widget responds in selected language
- [ ] Region persists across page refreshes

### Browser Testing
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### RTL Testing
- [ ] Arabic layout flows right-to-left
- [ ] Icons flip correctly
- [ ] Form inputs align properly
- [ ] Navigation menu works in RTL

---

## Deployment Steps

### 1. Deploy Backend (Railway)

```bash
# Commit all changes
git add .
git commit -m "feat: global internationalization (regions, languages, currencies)"

# Push to main - Railway auto-deploys
git push origin main
```

**Post-deploy:**
```bash
# Run migrations on Railway
railway run npx prisma migrate deploy

# Seed regions/currencies if needed
railway run npx prisma db seed
```

### 2. Deploy Frontend (Vercel)

```bash
# Frontend auto-deploys on push to main
# Verify build succeeds in Vercel dashboard
```

### 3. Verify Production

```bash
# Test API endpoints
curl https://api-production-445e.up.railway.app/api/regions
curl https://api-production-445e.up.railway.app/api/currencies
curl https://api-production-445e.up.railway.app/api/regions/detect

# Test Tars in Arabic
curl -X POST https://api-production-445e.up.railway.app/api/tars/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحبا", "sessionId": "test", "language": "ar"}'
```

---

## Rollback Plan

If issues occur:

1. **Revert commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database rollback (if schema changed):**
   ```bash
   railway run npx prisma migrate reset --skip-seed
   ```

3. **Feature flags (for gradual rollout):**
   - Add `ENABLE_GLOBAL_FEATURES=false` to disable

---

## Supported Regions

| Code | Name | Currency | Languages | RTL |
|------|------|----------|-----------|-----|
| US | United States | USD | en, es | No |
| AE | United Arab Emirates | AED | en, ar | Yes (ar) |
| GB | United Kingdom | GBP | en | No |
| SA | Saudi Arabia | SAR | ar, en | Yes |
| PK | Pakistan | PKR | en, ur | Yes (ur) |
| IN | India | INR | en, hi | No |
| DE | Germany | EUR | de, en | No |
| FR | France | EUR | fr, en | No |
| CA | Canada | CAD | en, fr | No |
| AU | Australia | AUD | en | No |
| QA | Qatar | QAR | ar, en | Yes |

---

## Supported Languages

| Code | Name | Native | RTL | Status |
|------|------|--------|-----|--------|
| en | English | English | No | ✅ Complete |
| ar | Arabic | العربية | Yes | ✅ Complete |
| ur | Urdu | اردو | Yes | ✅ Complete |
| hi | Hindi | हिन्दी | No | 🔄 Partial |
| es | Spanish | Español | No | 🔄 Partial |
| fr | French | Français | No | 🔄 Partial |
| de | German | Deutsch | No | 🔄 Partial |

**Note:** Partial = Tars AI responds in language, but UI translations not complete yet.

---

## Monitoring

### Key Metrics to Watch
- API response times (should be <200ms for region endpoints)
- Translation API usage (OpenAI costs)
- Tars AI usage by language
- Region distribution of users

### Error Monitoring
- Check Railway logs for API errors
- Check Vercel logs for frontend errors
- Monitor Supabase for database issues

---

## Post-Launch Tasks

- [ ] Announce global features to existing users
- [ ] Add more UI translations (Hindi, Spanish, French, German)
- [ ] Add region-specific promotional content
- [ ] Implement currency exchange rate auto-update
- [ ] Add more regions based on user demand
- [ ] A/B test region detection accuracy
