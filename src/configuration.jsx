import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBFbxQBsu_cya8JRoUa9k46s3kkf1o4LCI",
  authDomain: "report-comunita.firebaseapp.com",
  projectId: "report-comunita",
  storageBucket: "report-comunita.appspot.com",
  messagingSenderId: "982552667990",
  appId: "1:982552667990:web:a75408fa89b2050cedd8f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
// Now you can use Firebase services in your React app!