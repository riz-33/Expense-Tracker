import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, serverTimestamp, updateDoc, addDoc,
  onSnapshot, query, orderBy, getDocs, where, deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, db, doc, setDoc,
  getDoc, signOut, collection, serverTimestamp, updateDoc, addDoc, onSnapshot, query, orderBy, getDocs, where,
  deleteDoc
}