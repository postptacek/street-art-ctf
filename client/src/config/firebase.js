// Firebase configuration for Street Art CTF
// Using famu-nodes project for Firestore
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCES_Zfi78paxI--dycL2LmBK0-g4fvvEM",
  authDomain: "famu-nodes.firebaseapp.com",
  projectId: "famu-nodes",
  storageBucket: "famu-nodes.firebasestorage.app",
  messagingSenderId: "67316044555",
  appId: "1:67316044555:web:72a88c28871236912f480e",
  measurementId: "G-LB6V1P1JVW"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
