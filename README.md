# Job Portal Application

A complete, responsive Job Portal Web Application built with Vite + React, Firebase, and TailwindCSS.

## Features

* **Two User Types**: Job Seekers and Companies
* **Job Seeker Experience**: Create a profile, upload a resume, browse jobs, search by keywords/location, and apply for jobs.
* **Company Experience**: Create a company profile, post jobs, manage job listings, and review/update applicants' statuses.
* **Responsive UI**: Fully mobile-responsive interface with modern design aesthetics using Tailwind CSS.
* **Authentication**: Secure Firebase Email/Password Authentication with custom role claims.

---

## 🚀 Setup Instructions

### 1. Prerequisites
Make sure you have Node.js and npm installed on your machine.

### 2. Install Dependencies
Open a terminal in the project root (`c:\just\job-portal`) and run:
```bash
npm install
```

### 3. Firebase Setup
This project uses Firebase for Authentication, Firestore Database, and Storage.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Project Settings > General** and add a Web App.
3. Once the app is registered, you will be given a `firebaseConfig` object.
4. Copy the `.env.example` file to `.env` in the root of the project.
5. Fill in the `.env` variables using the keys provided in your Firebase Console.

```env
VITE_FIREBASE_API_KEY=your_api_key_from_console
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. Enable **Authentication**: In the Firebase console, go to Authentication > Sign-in method, and enable **Email/Password**.
7. Enable **Firestore Database**: Create a database. Start in Test Mode (or set up security rules).
8. Enable **Storage**: Create a default storage bucket for Resumes and Logos.

### 4. Running the Development Server
Once the environment variables are set, start the Vite dev server:
```bash
npm run dev
```

Visit the provided local URL (usually `http://localhost:5173`) in your browser to view and interact with the application.

## Project Structure

* `src/firebase/config.js`: Firebase initialization logic based on `.env` keys.
* `src/context/AuthContext.jsx`: Provides the globally authenticated user and their specific role across the app.
* `src/components/`: Reusable presentation and utility components like `ProtectedRoute`.
* `src/pages/auth/`: The distinct Role Select, Login, and specific Signup flows.
* `src/pages/public/`: Landing page and the Browse Jobs search page.
* `src/pages/jobseeker/`: Job Seeker specific pages and dashboard.
* `src/pages/company/`: Company specific pages, job posting, and applicant management.
