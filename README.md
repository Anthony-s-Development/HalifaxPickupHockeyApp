# Halifax Pickup Hockey

A cross-platform application for managing Halifax Pickup Hockey league check-ins and player management.

## Features

- User authentication with Firebase Auth
- Player profiles with position and regular night preferences
- Game check-in/check-out functionality
- Automatic waitlist management for non-regular players
- Time-based check-in restrictions (8 AM - 6 PM)
- Real-time player lists and waitlist
- Responsive design for iOS, Android, and Desktop

## Tech Stack

- Vue 3
- Ionic Framework
- Firebase (Auth + Firestore)
- Vite
- Pinia (State Management)

## Game Schedule

- Monday 11:00 PM - Forum
- Tuesday 10:30 PM - Forum
- Thursday 10:30 PM - Civic
- Friday 10:30 PM - Forum
- Saturday 10:30 PM - Forum

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd HalifaxPickupHockey
```

2. Install dependencies:

```bash
npm install
```

3. Create a Firebase project:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore database

4. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8100`

### Building for Production

```bash
npm run build
```

### Mobile Development

To build for iOS/Android, you'll need to add Capacitor:

```bash
npm install @capacitor/cli @capacitor/core
npx cap init
npx cap add ios
npx cap add android
```

Then build and sync:

```bash
npm run build
npx cap sync
npx cap open ios    # For iOS
npx cap open android # For Android
```

## Data Models

### User Profile

```javascript
{
  email: string,
  name: string,
  position: 'Forward' | 'Defense' | 'Goalie',
  regulars: {
    monday_11pm_forum: boolean,
    tuesday_1030pm_forum: boolean,
    thursday_1030pm_civic: boolean,
    friday_1030pm_forum: boolean,
    saturday_1030pm_forum: boolean
  },
  gamesPlayed: number,
  createdAt: string (ISO date)
}
```

### Game

```javascript
{
  date: string (YYYY-MM-DD),
  scheduleKey: string,
  venue: string,
  time: string (HH:MM),
  players: [{
    uid: string,
    name: string,
    position: string,
    checkedInAt: string (ISO date)
  }],
  waitlist: [{
    uid: string,
    name: string,
    position: string,
    checkedInAt: string (ISO date)
  }],
  createdAt: string (ISO date)
}
```

## Security Features

- Authentication required for check-in/check-out
- Users can only modify their own profile
- Users can only check themselves in/out (prevents others from checking you out)
- Time-based restrictions for check-ins
- Firestore security rules enforce data access controls

## Future Enhancements

- Push notifications for game reminders at 8:00 a.m. every morning, as well as 6:00 pm to advise that the skate checkin as closed for users that are checked in on waitlist, or the roster. Also, if the user gets moved from the waitlist to a team, it should notify them.
- Player statistics and analytics
- Payment integration
