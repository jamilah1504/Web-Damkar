// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3FANR7K2-3B1RQ3z06Mrm_O-StSZoYEs",
  authDomain: "damkar-21ca7.firebaseapp.com",
  projectId: "damkar-21ca7",
  storageBucket: "damkar-21ca7.firebasestorage.app",
  messagingSenderId: "299558216837",
  appId: "1:299558216837:web:d1595d395ffb06436875ec",
  measurementId: "G-Y8GS3CPGM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);