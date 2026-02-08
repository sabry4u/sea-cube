# 🌊 Underwater Archaeology Image Classifier - Project Blueprint

## Executive Summary

**Project**: Mobile-first web app for underwater archaeology image classification and team matching  
**Purpose**: School project demonstration for judges  
**Timeline**: Prototype-ready (1-2 weeks with Claude Code)  
**Deployment**: Cloudflare Pages (free tier, global edge)

---

## 🎯 Tech Stack & Rationale

### Frontend + Backend: **Next.js 14 (TypeScript)**
**Why:**
- Mobile-responsive PWA out of the box
- Server Actions eliminate need for separate API
- TypeScript prevents runtime errors
- Large community, well-documented (Claude Code knows it well)
- Hot reload for rapid development

### AI Vision: **Anthropic Claude Sonnet 4**
**Why:**
- Strong multimodal capabilities (image + text reasoning)
- Excellent safety filtering (privacy/content moderation)
- Structured output (JSON) for confidence scores
- You're already familiar with Claude ecosystem

### Database: **Cloudflare D1 (SQLite)**
**Why:**
- Serverless (no maintenance)
- Free tier (perfect for prototype)
- Built-in with Cloudflare Pages deployment
- SQL familiarity for future scaling

### Styling: **Tailwind CSS**
**Why:**
- Mobile-first by default
- Rapid prototyping
- No CSS file management
- Claude Code generates Tailwind well

### Deployment: **Cloudflare Pages + GitHub Actions**
**Why:**
- Push to GitHub → Auto-deploy
- Global CDN (fast for judges anywhere)
- Free SSL certificate
- Zero configuration

---

## 📊 User Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  Judge scans QR code → Opens web app in browser     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Landing Page                                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ Select Location: [Dropdown ▼]                │  │
│  │ • Mediterranean Sea                           │  │
│  │ • Caribbean Sea                               │  │
│  │ • Pacific Ocean                               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Confidence Threshold: [Dropdown ▼]           │  │
│  │ • 50% - Low (finds more objects)              │  │
│  │ • 65% - Medium (balanced) [DEFAULT]           │  │
│  │ • 80% - High (more precise)                   │  │
│  │ • 95% - Very High (strict)                    │  │
│  └──────────────────────────────────────────────┘  │
│  [Choose Image / Take Photo] Button               │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  File Picker Opens                                   │
│  (User uploads existing image OR takes new photo)   │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Loading Screen: "Analyzing image..."               │
│  (Shows spinner)                                     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  Backend: Claude Vision Analysis                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Step 1: Privacy/Security Check                │  │
│  │ ❌ NSFW? Sexually explicit?                   │  │
│  │ ❌ Human faces visible?                       │  │
│  │ ❌ Gore/violence?                             │  │
│  │ → If YES: STOP → Error 5.1                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Step 2: Underwater Check                      │  │
│  │ ❌ Is this an underwater image?               │  │
│  │ → If NO: STOP → Error 5.2                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Step 3: Man-made Object Detection             │  │
│  │ ✅ Does image contain man-made object?        │  │
│  │ 📊 Confidence: 78%                            │  │
│  │ → If <threshold: STOP → Error 5.3 or 5.4      │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Step 4: Object Type Identification            │  │
│  │ 🏺 Object Type: "Amphora"                     │  │
│  │ 📊 Confidence: 82%                            │  │
│  │ → If <threshold: STOP → Error 5.4             │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Step 5: Database Lookup                       │  │
│  │ Query: location="mediterranean" +             │  │
│  │        object_type="amphora"                  │  │
│  │ → Result: Team found OR not found             │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▼
         ┌─────────────┴─────────────┐
         ▼                           ▼
    ❌ ERROR                     ✅ SUCCESS
┌──────────────────┐      ┌──────────────────────┐
│ Error Messages:  │      │ Success Message:     │
│                  │      │                      │
│ 5.1: Security    │      │ "Match Found! 🎉"    │
│ 5.2: Not UW      │      │                      │
│ 5.3: No object   │      │ Team: Mediterranean  │
│ 5.4: Low conf.   │      │ Diggers              │
│ 5.5: No match    │      │                      │
│      (→ Form)    │      │ Project: Ancient     │
│                  │      │ Trade Routes         │
│ [OK] Button      │      │                      │
└────────┬─────────┘      │ Object: Amphora      │
         │                │ Confidence: 82%      │
         │                │                      │
         │                │ [OK] Button          │
         │                └──────────┬───────────┘
         └────────────────┬──────────┘
                          ▼
              ┌───────────────────────┐
              │ Return to Upload Page │
              └───────────────────────┘
```

---

## 🗄️ Database Schema (Cloudflare D1)

### Table: `archaeology_teams`

```sql
-- Create teams table
CREATE TABLE IF NOT EXISTS archaeology_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL,
  location TEXT NOT NULL,
  object_type TEXT NOT NULL,
  project_name TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location, object_type)
);

-- Create index for faster lookups
CREATE INDEX idx_location_object ON archaeology_teams(location, object_type);
```

### Seed Data (20 Synthetic Entries)

```sql
-- Mediterranean Teams
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Mediterranean Diggers', 'mediterranean', 'amphora', 'Ancient Trade Routes', 'Specializing in Greek and Roman pottery vessels'),
  ('Mediterranean Diggers', 'mediterranean', 'pottery', 'Ancient Trade Routes', 'Ceramic analysis and dating'),
  ('Mediterranean Diggers', 'mediterranean', 'statue', 'Ancient Trade Routes', 'Bronze and marble sculptures'),
  ('Hellenic Heritage', 'mediterranean', 'anchor', 'Ancient Shipwrecks', 'Greek and Roman anchor recovery'),
  ('Hellenic Heritage', 'mediterranean', 'coin', 'Ancient Shipwrecks', 'Numismatic analysis'),
  ('Roman Wreck Recovery', 'mediterranean', 'ship', 'Merchant Vessels', 'Roman ship reconstruction'),
  ('Roman Wreck Recovery', 'mediterranean', 'cargo', 'Merchant Vessels', 'Trade goods analysis');

-- Caribbean Teams  
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Caribbean Pirates Ahoy', 'caribbean', 'anchor', 'Pirate Ship Recovery', '17th century pirate vessel excavation'),
  ('Caribbean Pirates Ahoy', 'caribbean', 'cannon', 'Pirate Ship Recovery', 'Naval artillery preservation'),
  ('Caribbean Pirates Ahoy', 'caribbean', 'chest', 'Pirate Ship Recovery', 'Treasure and cargo documentation'),
  ('Colonial Trade Institute', 'caribbean', 'pottery', 'Colonial Settlements', 'European colonial ceramics'),
  ('Colonial Trade Institute', 'caribbean', 'tool', 'Colonial Settlements', 'Maritime trade tools'),
  ('Galleon Hunters', 'caribbean', 'ship', 'Spanish Treasure Fleet', 'Spanish galleon excavation'),
  ('Galleon Hunters', 'caribbean', 'coin', 'Spanish Treasure Fleet', 'Spanish colonial currency');

-- Pacific Teams
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Pacific Explorers', 'pacific', 'pottery', 'Polynesian Artifacts', 'Traditional Polynesian ceramics'),
  ('Pacific Explorers', 'pacific', 'tool', 'Polynesian Artifacts', 'Navigation and fishing implements'),
  ('Pacific Explorers', 'pacific', 'statue', 'Polynesian Artifacts', 'Stone carvings and tikis'),
  ('WWII Heritage', 'pacific', 'ship', 'Naval Archaeology', 'WWII shipwreck documentation'),
  ('WWII Heritage', 'pacific', 'aircraft', 'Naval Archaeology', 'Underwater aircraft recovery'),
  ('Asian Maritime', 'pacific', 'anchor', 'Ancient Asian Trade', 'Chinese and Japanese maritime trade');
```

### Table: `upload_logs` (Optional - for audit trail)

```sql
CREATE TABLE IF NOT EXISTS upload_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  confidence_threshold INTEGER,
  object_detected TEXT,
  object_confidence REAL,
  team_matched TEXT,
  error_type TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_uploaded_at ON upload_logs(uploaded_at DESC);
```

---

## 🔌 API Endpoints (Next.js Server Actions)

### 1. **POST /api/analyze-image**

**Input:**
```typescript
{
  image: File,              // Image file from user
  location: string,         // 'mediterranean' | 'caribbean' | 'pacific'
  confidenceThreshold: number  // 50 | 65 | 80 | 95
}
```

**Process:**
1. Convert image to base64
2. Call Claude Vision API with multi-step prompt
3. Parse structured JSON response
4. Query D1 database if object found
5. Log to `upload_logs` table

**Output:**
```typescript
{
  success: boolean,
  error?: {
    code: string,  // '5.1' | '5.2' | '5.3' | '5.4' | '5.5'
    message: string
  },
  result?: {
    teamName: string,
    projectName: string,
    objectType: string,
    objectConfidence: number,
    manMadeConfidence: number
  }
}
```

### 2. **POST /api/submit-review**

**Input:**
```typescript
{
  name: string,
  email: string,
  location: string,
  objectDetected: string,
  confidence: number,
  timestamp: string
}
```

**Output:**
```typescript
{
  success: boolean,
  message: string
}
```

---

## 🎨 Component Breakdown

```
src/
├── app/
│   ├── page.tsx                 # Main upload page
│   ├── layout.tsx              # Root layout (PWA config)
│   └── api/
│       ├── analyze-image/
│       │   └── route.ts        # Image analysis endpoint
│       └── submit-review/
│           └── route.ts        # Review form submission
├── components/
│   ├── UploadForm.tsx          # Location + Confidence + File picker
│   ├── LoadingSpinner.tsx      # Analysis in progress
│   ├── ResultModal.tsx         # Success/Error display
│   ├── ReviewRequestForm.tsx   # Form for no-match cases
│   └── QRCodeGenerator.tsx     # (Optional) Generate test QR codes
├── lib/
│   ├── claude.ts               # Claude API wrapper
│   ├── db.ts                   # D1 database client
│   └── types.ts                # TypeScript interfaces
└── public/
    └── test-images/            # Sample underwater images for testing
```

---

## 🤖 Claude Vision Prompt Template

```typescript
const ANALYSIS_PROMPT = `You are analyzing an underwater image for an archaeology project.

Perform these checks in order and return structured JSON:

1. SAFETY CHECK:
   - Does the image contain NSFW content, sexually explicit material, human faces, gore, or violence?
   - Return: { "safetyViolation": true/false, "violationType": "string or null" }

2. UNDERWATER CHECK:
   - Is this clearly an underwater photograph (marine environment, water visibility, aquatic features)?
   - Return: { "isUnderwater": true/false, "reasoning": "brief explanation" }

3. MAN-MADE OBJECT DETECTION:
   - Does the image contain any man-made/artificial objects?
   - Provide confidence score (0-100)
   - Return: { "hasManMadeObject": true/false, "manMadeConfidence": number }

4. OBJECT IDENTIFICATION:
   - If man-made object found, identify the specific type
   - Categories: amphora, pottery, statue, anchor, coin, ship, cargo, cannon, chest, tool, aircraft
   - Provide confidence score (0-100)
   - Return: { "objectType": "string or null", "objectConfidence": number }

Return ONLY valid JSON with this structure:
{
  "safetyViolation": boolean,
  "violationType": string | null,
  "isUnderwater": boolean,
  "underwaterReasoning": string,
  "hasManMadeObject": boolean,
  "manMadeConfidence": number,
  "objectType": string | null,
  "objectConfidence": number
}`;
```

---

## ⚠️ Error Handling Matrix

| Code | Condition | Message | Action |
|------|-----------|---------|--------|
| 5.1 | `safetyViolation === true` | "Error: Your image didn't pass security guardrails. Please upload an appropriate underwater archaeology image." | Show OK button → Return to upload |
| 5.2 | `isUnderwater === false` | "Error: Your image is not an underwater image. Please upload a photo taken underwater." | Show OK button → Return to upload |
| 5.3 | `hasManMadeObject === false` | "Error: Didn't find any man-made object in the image. Please upload an image containing archaeological artifacts." | Show OK button → Return to upload |
| 5.4 | `manMadeConfidence < threshold` OR `objectConfidence < threshold` | "Error: Object identified is below confidence level (Threshold: {threshold}%, Detected: {confidence}%). Try uploading a clearer image or adjusting the confidence threshold." | Show OK button → Return to upload |
| 5.5 | Database query returns no match | "Warning: Your image didn't match any team in our database. Would you like to submit a review request?" | Show review form OR OK button → Return to upload |
| ✅ | Success | "Success! Your image had an object that matches the Archaeology team '{teamName}' - {projectName}<br>Object: {objectType} ({objectConfidence}% confidence)" | Show OK button → Return to upload |

---

## 📁 File Structure (Complete)

```
underwater-archaeology-app/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Auto-deploy to Cloudflare Pages
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Main upload interface
│   │   └── api/
│   │       ├── analyze-image/
│   │       │   └── route.ts
│   │       └── submit-review/
│   │           └── route.ts
│   ├── components/
│   │   ├── UploadForm.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ResultModal.tsx
│   │   └── ReviewRequestForm.tsx
│   └── lib/
│       ├── claude.ts              # Claude API client
│       ├── db.ts                  # D1 database client
│       └── types.ts               # TypeScript interfaces
├── public/
│   └── test-images/               # Sample test images
├── .env.local                     # API keys (gitignored)
├── .gitignore
├── CLAUDE.md                      # ← Project context for Claude Code
├── PROJECT-PLAN.md                # ← This file (comprehensive documentation)
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── wrangler.toml                  # Cloudflare configuration
└── README.md
```

---

## 🚀 Implementation Plan (Phased Approach)

### Phase 1: Foundation (Day 1)
**Goal**: Basic Next.js app with database setup

**Tasks**:
1. Initialize Next.js 14 project with TypeScript + Tailwind
2. Set up Cloudflare D1 database
3. Create database schema and seed with 20 teams
4. Set up environment variables
5. Create basic UI components (UploadForm, LoadingSpinner, ResultModal)

**Claude Code Prompt**:
```
Create a Next.js 14 app with:
- TypeScript strict mode
- Tailwind CSS
- App Router structure
- Cloudflare D1 database setup
- Database schema from CLAUDE.md
- Basic upload form with location dropdown and confidence selector
- File picker for image upload
```

### Phase 2: Claude Vision Integration (Day 2-3)
**Goal**: Image analysis working end-to-end

**Tasks**:
1. Implement Claude API client (`lib/claude.ts`)
2. Create `/api/analyze-image` server action
3. Build multi-step vision prompt
4. Parse structured JSON responses
5. Handle all error states (5.1 - 5.4)

**Claude Code Prompt**:
```
Implement Claude Vision API integration:
- Create claude.ts wrapper for Anthropic API
- Implement analyze-image server action
- Use the multi-step analysis prompt from CLAUDE.md
- Return structured JSON matching TypeScript types
- Handle errors 5.1, 5.2, 5.3, 5.4
- Test with sample underwater images
```

### Phase 3: Database Matching (Day 3-4)
**Goal**: Team lookup and success state

**Tasks**:
1. Implement D1 query logic
2. Match location + object_type → team
3. Build success result display
4. Create review request form (error 5.5)
5. Implement audit logging

**Claude Code Prompt**:
```
Add database team matching:
- Query D1: SELECT * FROM archaeology_teams WHERE location=? AND object_type=?
- If match found: show success with team details
- If no match (error 5.5): show review request form
- Create /api/submit-review endpoint
- Log all uploads to upload_logs table
```

### Phase 4: UI Polish (Day 4-5)
**Goal**: Mobile-optimized, production-ready UI

**Tasks**:
1. Responsive design testing (iOS Safari, Android Chrome)
2. Loading states and transitions
3. Error message styling
4. Accessibility improvements (ARIA labels, keyboard navigation)
5. Add PWA manifest for "Add to Home Screen"

**Claude Code Prompt**:
```
Polish mobile UI:
- Make fully responsive (test on mobile viewport)
- Add smooth transitions between states
- Style error messages with appropriate colors (red for errors, yellow for warnings, green for success)
- Add PWA manifest.json
- Ensure accessibility (ARIA labels, focus management)
- Add loading skeleton for image analysis
```

### Phase 5: Deployment (Day 5)
**Goal**: Live on Cloudflare Pages

**Tasks**:
1. Create GitHub repository
2. Set up Cloudflare Pages project
3. Configure environment variables in Cloudflare
4. Set up GitHub Actions for auto-deploy
5. Generate test QR codes pointing to production URL
6. Create test image library

**Claude Code Prompt**:
```
Set up Cloudflare Pages deployment:
- Create wrangler.toml configuration
- Set up GitHub Actions workflow (.github/workflows/deploy.yml)
- Configure D1 database binding
- Create deployment documentation
- Generate 3 test QR codes (one per location)
- Document testing procedure for judges
```

---

## 🧪 Testing Plan

### Manual Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Happy Path** | 1. Select "Mediterranean"<br>2. Select "65%" confidence<br>3. Upload amphora image | ✅ "Success! Mediterranean Diggers - Ancient Trade Routes" |
| **Security Violation** | Upload image with human face | ❌ Error 5.1 message |
| **Not Underwater** | Upload land-based image | ❌ Error 5.2 message |
| **No Object** | Upload underwater scene without artifacts | ❌ Error 5.3 message |
| **Low Confidence** | Upload blurry image, set 95% threshold | ❌ Error 5.4 message |
| **No Team Match** | Upload valid object from unlisted combination | ⚠️ Error 5.5 + Review form |
| **Confidence Adjustment** | Same image, lower threshold from 95% to 50% | ✅ Success (demonstrates threshold effect) |
| **Mobile Safari** | Test all flows on iOS Safari | All features work |
| **Android Chrome** | Test all flows on Android Chrome | All features work |

### Sample Test Images Needed

Create/acquire these test images:
1. ✅ **Mediterranean amphora** (clear, high quality)
2. ✅ **Caribbean cannon** (underwater scene)
3. ✅ **Pacific pottery** (polynesian style)
4. ❌ **Face visible** (diver selfie)
5. ❌ **Land-based** (beach/dock photo)
6. ❌ **No artifact** (empty underwater scene)
7. ❌ **Blurry** (low confidence test)
8. ⚠️ **Unknown object** (underwater object not in database)

---

## 🔐 Security & Privacy Considerations

### API Key Management
- Never commit `.env.local` to Git
- Use Cloudflare Pages environment variables for production
- Rotate keys quarterly

### Content Moderation
- Claude Vision API handles NSFW detection
- Additional client-side file type validation
- Server-side file size limits (max 10MB)

### Data Privacy
- No user authentication = no PII collection
- Upload logs store only metadata (no images)
- Review form: minimal data (name, email, timestamp)
- Optional: Auto-delete logs after 30 days

### Rate Limiting
- Implement Cloudflare rate limiting (100 requests/hour per IP)
- Prevent API key abuse

---

## 💰 Cost Estimate (Prototype)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Cloudflare Pages | Unlimited requests | <1000/day | **$0** |
| Cloudflare D1 | 5M reads/day, 100K writes/day | <500 writes | **$0** |
| Anthropic Claude API | Pay-as-you-go | ~100 images @ $0.003/image | **$0.30** |
| GitHub | Free public repos | 1 repo | **$0** |
| **TOTAL** | | | **$0.30** |

**Production estimate** (1000 images/day): ~$3/day or $90/month

---

## 📱 QR Code Generation

### For Demo/Judges

Create 3 QR codes pointing to your deployed URL:

**QR Code 1 (Mediterranean)**:
```
https://yourapp.pages.dev
```

**QR Code 2 (Caribbean)**:
```
https://yourapp.pages.dev
```

**QR Code 3 (Pacific)**:
```
https://yourapp.pages.dev
```

*Note*: Since we're using Option B (location dropdown), all QR codes point to the same URL. Users manually select location after scanning.

**Alternative**: Add URL parameter for pre-selected location
```
https://yourapp.pages.dev?location=mediterranean
https://yourapp.pages.dev?location=caribbean
https://yourapp.pages.dev?location=pacific
```

Then auto-select location in dropdown if URL param exists.

---

## 🎓 Educational Value (For School Presentation)

**Concepts Demonstrated**:
1. **AI/ML**: Computer vision for object detection
2. **Full-stack development**: Frontend + Backend + Database
3. **API integration**: RESTful patterns with external AI service
4. **Mobile-first design**: PWA, responsive UI
5. **Database design**: Relational schema, indexing
6. **Error handling**: Comprehensive validation and user feedback
7. **Deployment**: CI/CD pipeline, serverless architecture
8. **Confidence thresholds**: Trade-offs between precision and recall

**Presentation Tips**:
- Show live demo with pre-tested images
- Explain the confidence threshold slider (precision vs. recall)
- Demonstrate error states (security, underwater check, etc.)
- Discuss real-world applications (marine archaeology, environmental monitoring)

---

## ✅ Success Criteria

**Prototype is complete when**:
- [ ] QR code opens app in mobile browser
- [ ] Location dropdown has 3 options
- [ ] Confidence selector has 4 options
- [ ] File picker accepts images
- [ ] Claude Vision analyzes images successfully
- [ ] All 6 result states work (5 errors + 1 success)
- [ ] Database returns correct team matches
- [ ] Review form submits (error 5.5)
- [ ] OK button returns to upload page
- [ ] Deployed to Cloudflare Pages with custom domain
- [ ] Works on iOS Safari and Android Chrome
- [ ] Response time <5 seconds per image
