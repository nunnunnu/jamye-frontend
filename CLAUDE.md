# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"잼얘가챠" (Jamye-gacha) is a Vue.js 3 web and mobile application that allows users to save memories as messages or posts within groups, then randomly "draw" them later like a gacha game. The app supports both web browsers and Android devices via Cordova.

- **Frontend:** Vue.js 3, Vue Router, Bootstrap
- **Mobile:** Cordova (Android)
- **API Communication:** Axios with centralized interceptors
- **Real-time:** WebSocket via SockJS + STOMP
- **Client Storage:** IndexedDB (via `idb` library) for draft messages, images, and nickname mappings

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run serve

# Build for production
npm run build

# Lint files
npm run lint
```

## Deployment

The project uses GitHub Actions for CI/CD. On push to `main`, the workflow:
1. Installs dependencies
2. Builds the project
3. Deploys to AWS S3 (`jamye-frontend` bucket)

The production site is served via AWS CloudFront with ACM for HTTPS.

## Architecture

### Authentication & Token Management

- Access/refresh tokens stored in `localStorage`
- Axios interceptor (`src/js/axios.js`) automatically:
  - Adds `Authorization` header to requests
  - Shows loading overlay during API calls
  - Handles 403 errors by refreshing tokens via `/api/user/refresh`
  - Redirects to login on token refresh failure

### WebSocket Connection

- Managed in `App.vue` via SockJS + STOMP
- Connects on login, disconnects on logout
- Subscribes to:
  - `/alarm/receive/{userSeq}` - unread message count updates
  - `/alarm/group/delete/{userSeq}` - group deletion vote notifications
- Uses environment-specific initialization for Cordova vs web

### State Management

- No Vuex/Pinia; global state lives in root `App.vue`
- Key state: `isLogin`, `unreadCount`, `deleteVote`, WebSocket connection status
- `localStorage` stores: `accessToken`, `refreshToken`, `id`, `sequence`, `groupSeq`

### IndexedDB Storage (`src/js/store.js`)

Database: `chatDB` (version 3)

Object stores:
- `messages` - draft messages (keyPath: `id`)
- `nicknames` - nickname mappings (keyPath: `user`)
- `images` - uploaded images (keyPath: `id`)
- `temp_storage` - temporary data like nickname arrays (keyPath: `key`)

Key functions:
- `saveMessage(chat)` - save draft message
- `getAllMessages()` - load all drafts
- `saveNickname(user, nickname)` / `getNicknames()` - nickname mapping
- `saveImage(image)` / `getAllImages()` - image storage
- `clearMessages()` - clear all IndexedDB data

### Component Structure

```
src/
├── App.vue                  # Root: navbar, WebSocket, loading overlay
├── components/
│   ├── MainHome.vue         # Main page: gacha draw, group selection
│   ├── NavBar.vue           # Navigation bar
│   ├── FooterView.vue       # Footer
│   ├── ImagePreviewOpen.vue # Image preview modal
│   ├── post/                # Post-related components
│   │   ├── MessageCreate.vue    # Create message-type posts
│   │   ├── PostCreate.vue       # Create board-type posts
│   │   ├── MessageJamye.vue     # View message posts
│   │   ├── BoardJamye.vue       # View board posts
│   │   ├── JamyeList.vue        # List all posts with filters
│   │   ├── CommentList.vue      # Comment management
│   │   └── ImageBox.vue         # Image storage/selection
│   ├── group/               # Group management
│   │   ├── GroupInfos.vue       # List all groups
│   │   ├── GroupInfo.vue        # Group detail page
│   │   ├── GroupAdd.vue         # Create/join group
│   │   ├── LeaveGroup.vue       # Leave group
│   │   ├── EditProfile.vue      # Edit group member profile
│   │   └── VoteStatusBar.vue    # Group deletion vote status
│   └── user/                # User management
│       ├── Login.vue            # Login page
│       ├── MyPage.vue           # User profile page
│       ├── MemberJoin.vue       # Sign up
│       ├── UserInfoEdit.vue     # Edit user info
│       ├── NotifyBox.vue        # Message inbox
│       ├── DiscordLogin.vue     # Discord OAuth callback
│       ├── KakaoLogin.vue       # Kakao OAuth callback
│       └── FindId.vue           # Find user ID
├── js/
│   ├── axios.js             # Axios instance with interceptors
│   ├── config.js            # API URLs, image CDN config
│   ├── store.js             # IndexedDB wrapper
│   ├── scripts.js           # Utility functions
│   ├── fileScripts.js       # File handling utilities
│   ├── tutorialHelper.js    # Tutorial/onboarding logic
│   ├── tourEventListeners.js # Tour event handling
│   └── cordova-fcm.js       # Firebase Cloud Messaging for Cordova
└── router/index.js          # Vue Router configuration
```

### Message Creation Flow

1. User navigates to `/create/message{seq}` (MessageCreate.vue)
2. Can upload images for OCR-based message extraction
3. Messages saved to IndexedDB as drafts
4. Nickname mapping modal allows matching extracted names to group members
5. On submit, messages + images sent to backend API
6. IndexedDB cleared on successful submission

### Configuration (`src/js/config.js`)

- `BASE_URL` - backend API endpoint
- `IMAGE_URL` - CloudFront CDN for images
- `redirect_uri` / `redirectBaseUrl` - OAuth redirect URLs
- Comment out production URLs and uncomment localhost for local development

## Key Patterns

### Lazy Loading

Routes use lazy loading for components (except core components like MainHome, Login).

### Loading Indicator

- Controlled by `setLoadingCallback` in `src/js/axios.js`
- Shows overlay spinner during API requests
- Can be skipped per-request via `config.skipLoading = true`

### Toast Notifications

- Configured in `App.vue` styles with custom success/warning/error themes
- Use via `toast.error()`, `toast.success()`, `toast.warning()` (imported from `@/main`)

### Route Parameters

- Path params: `:seq`, `:postSeq`, etc.
- Query params: `?groupSeq=...`, `?keyword=...`, `?tags=...`
- Example: `/jamye/message:postSeq?groupSeq=123`

## Cordova-Specific

- Check `window.cordova` to detect mobile environment
- Wait for `deviceready` event before initializing plugins
- FCM token handling in `src/js/cordova-fcm.js`
- WebSocket connection delayed by 2s on Cordova to ensure network ready

## Vue Configuration (`vue.config.js`)

- `filenameHashing: false` - disables hash suffixes in build output
- Entry point: `src/main.js`
- Title: "잼얘가챠"
