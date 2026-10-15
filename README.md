# APFC Smart Test — UPSC EPFO Exam Preparation App

A mobile-first Android test preparation application engineered for aspirants of the **UPSC Assistant Provident Fund Commissioner (APFC)** and **EPFO Enforcement Officer/Accounts Officer (EO/AO)** examinations.

Designed specifically for users preparing on an Android phone, APFC Smart Test provides:
- **100-Question Note-to-Test Generator**: Automatically generates exactly 100 authentic, four-option multiple-choice questions strictly from uploaded notes (PDF, DOCX, TXT, or pasted text), divided into **5 sets of 20 questions each**.
- **Instant Locked Feedback**: Immediate green/red color highlighting upon selecting an answer with comprehensive explanations and statutory citations.
- **100% Offline Capability**: All uploaded notes, question sets, demo practice sets, bookmarks, and past attempt histories persist in local on-device storage. No account or login is required.
- **Android Immersive Fullscreen**: Automatic hiding of system bars during active test taking with Screen Wake Lock and haptic feedback.
- **Multiple APK & Installation Options**: Instant 1-tap Android WebAPK install, automated GitHub Actions Cloud Build workflow for building `app-debug.apk`, and on-phone Termux compilation.

---

## 📱 Platform & Android Delivery

### Option 1: 1-Tap Direct Install on Android Phone (WebAPK / Standalone PWA)
1. Open this application in Google Chrome on your Android phone.
2. Tap the **"Install APK"** button in the top navigation bar, or open the Chrome menu (three vertical dots &vellip;) and tap **"Install app"** or **"Add to Home screen"**.
3. Confirm the prompt. The app installs directly as a standalone Android application with custom icon, splash screen, and full offline caching.

### Option 2: Automated Cloud APK Build via GitHub Actions (Zero Setup)
You do not need Android Studio or a desktop computer to obtain a real debug APK.
1. Push or fork this repository to your GitHub account.
2. Navigate to the **Actions** tab in your repository.
3. Select the **"Build Android APK (APFC Smart Test)"** workflow and click **"Run workflow"** (or push any commit to `main`).
4. GitHub automatically runs Java 17, Gradle, and Capacitor to compile `app-debug.apk`.
5. Once the run finishes (~2 minutes), download the **`APFC-Smart-Test-Debug-APK`** artifact directly onto your Android phone and install.

### Option 3: Compile APK Directly ON Your Android Phone via Termux
For power users who prefer compiling locally on device:
```bash
# 1. Install prerequisites in Termux:
pkg update && pkg install nodejs-lts openjdk-17 git

# 2. Build the web distribution:
npm install
npm run build

# 3. Synchronize and compile the Android APK:
npx cap sync android
cd android
./gradlew assembleDebug
```
The resulting APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📋 Key Features & Architecture

### 1. Document Upload & 100-Question Five-Set Division
- **Supported Formats**: Searchable PDF files, Microsoft Word (.docx), plain text (.txt), and direct text paste.
- **Content Validation**: Verifies that notes contain at least 150 words to guarantee deep syllabus coverage and prevent hallucination.
- **Division into 5 Sets of 20**: The 100 questions are systematically allocated into five themed test sets:
  - *Set 1*: Statutory Provisions & Definitions
  - *Set 2*: Eligibility, Numerical Thresholds & Statutory Appointments
  - *Set 3*: Procedural Mechanisms & Welfare Schemes
  - *Set 4*: Penalties, Appeals, Redressal & Exceptions
  - *Set 5*: Comprehensive Application & Case-Based Problems
- **Local Database Persistence**: All generated questions are saved persistently on device so they never need to be regenerated.

### 2. Critical Answer Feedback Rules
When an option is tapped:
- **Instant Lock**: The question immediately locks to prevent hindsight modifications.
- **Correct Selection**: The selected option is highlighted **GREEN** with a checkmark badge.
- **Incorrect Selection**: The chosen option is highlighted **RED** with an **X** badge, and the actual correct option is simultaneously highlighted **GREEN** with a checkmark badge.
- **Rule Verification**: The correct answer is **never** shown in red, and the app never hides the correct choice when a user makes an error.
- **Explanation Box**: Appears immediately underneath, citing specific sections (e.g., Section 2(f) EPF Act, AS-2 Inventory Valuation, Article 43A).

### 3. Exam Configuration & Marking Scheme
- **Configurable Timer**: Default 30 minutes for a 20-question set (configurable to 15, 20, 30, 45, or 60 minutes in Settings).
- **Standard APFC Marking**: Default `+1.0` for correct, `-0.33` for incorrect, and `0` for unanswered. Configurable in Settings (e.g. `+2.0` / `-0.66`).
- **Question Palette**: 20-question numbered grid showing Answered (Green), Unanswered (Slate), Review Marked (Amber), and Answered & Marked (Purple).
- **Auto-Submission**: Automatically submits and scores the test when the countdown reaches 00:00.

### 4. Independent Reattempt History
- Reattempting a set uses `shuffleAttempt()` to randomize the question sequence and option order while preserving exact correct answer mapping.
- All previous attempt records are preserved in history (showing historical scores, best score, latest score, and accuracy).

### 5. Revision & Mistake Bank
- Any question answered incorrectly during tests is automatically indexed in the **Errors Bank**.
- Aspirants can bookmark questions anytime and review them offline.

---

## 🗂️ File Structure

```
├── .github/workflows/
│   └── build-apk.yml          # GitHub Actions Cloud Build for Android APK
├── public/
│   ├── icon.svg               # Vector brand emblem (maskable & any)
│   └── manifest.json          # PWA Web App Manifest for Android install
├── src/
│   ├── components/
│   │   ├── ApkExportModal.tsx     # Android PWA install & APK cloud build modal
│   │   ├── Header.tsx             # Sticky mobile top bar with offline & fullscreen status
│   │   ├── HomeView.tsx           # Home dashboard: stats, notes cards, 5-set list, demo set
│   │   ├── QuestionBankView.tsx   # Offline revision for mistakes and bookmarks
│   │   ├── QuestionPalette.tsx    # Numbered grid drawer with status color-coding
│   │   ├── ResultsView.tsx        # Scorecard, negative marking breakdown, topic stats
│   │   ├── ReviewModal.tsx        # Step-by-step review with Green/Red highlights
│   │   ├── SettingsModal.tsx      # Timer, marking scheme, vibration, and theme configuration
│   │   ├── TestRunner.tsx         # Active test engine: timer, locked feedback, wake lock
│   │   └── UploadModal.tsx        # PDF/DOCX/TXT extraction & 100-question generation
│   ├── hooks/
│   │   └── usePWAInstall.ts       # Hook for Android beforeinstallprompt
│   ├── types/
│   │   ├── index.ts               # Core TypeScript data interfaces
│   │   └── mammoth.d.ts           # DOCX parser type declarations
│   ├── utils/
│   │   ├── demoData.ts            # Preloaded 20-question official UPSC APFC demo set
│   │   ├── fullscreen.ts          # Android fullscreen, wake lock, and haptics
│   │   ├── scoring.ts             # Pure logic: marking, accuracy, feedback states
│   │   ├── scoring.test.ts        # Node:test unit test suite
│   │   ├── storage.ts             # On-device persistent storage manager
│   │   └── textExtractor.ts       # Text extractor for PDF, DOCX, TXT, and paste
│   ├── App.tsx                    # Top-level application coordinator
│   ├── index.css                  # Tailwind styles and mobile viewport touch handling
│   └── main.tsx                   # React root entry
├── capacitor.config.json      # Capacitor Android native configuration
├── server.ts                  # Server-side Express proxy for Gemini API question generation
└── package.json               # Dependencies and scripts
```

---

## 🔒 Privacy & AI Configuration

- **Zero Third-Party Telemetry**: Study notes and test records remain strictly on the user's device in local storage.
- **Server-Side AI API**: Question generation requests are processed securely via the server-side `/api/generate-set` proxy using `@google/genai` and `gemini-3.8-flash`. API keys are never exposed to client bundles.
- **Offline Resilience**: Once questions are generated, or when using the preloaded UPSC APFC Demo Practice Set, the entire application operates completely offline without internet connectivity.
