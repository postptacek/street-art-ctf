// Firebase configuration
// To set up:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project called "street-art-ctf"
// 3. Add a web app to the project
// 4. Copy the config values below
// 5. Enable Firestore Database (start in test mode)
// 6. Enable Authentication > Anonymous sign-in

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
