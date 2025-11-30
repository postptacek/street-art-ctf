// Firebase configuration for Street Art CTF
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAz0HX_QrTS2uB7hVXw86RUlXoB6jsIReA",
  authDomain: "skan-2f8d5.firebaseapp.com",
  projectId: "skan-2f8d5",
  storageBucket: "skan-2f8d5.firebasestorage.app",
  messagingSenderId: "839263869032",
  appId: "1:839263869032:web:35b2bf59f90430075a83dd",
  measurementId: "G-JZSJKTE4LL"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
