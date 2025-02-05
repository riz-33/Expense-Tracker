import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, serverTimestamp, updateDoc, addDoc,
  onSnapshot, query, orderBy, getDocs, where, deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfJlRsqiFtSs4dSCXY1N5kjqTLMcIiF9Y",
  authDomain: "expense-tracker-29c10.firebaseapp.com",
  projectId: "expense-tracker-29c10",
  storageBucket: "expense-tracker-29c10.firebasestorage.app",
  messagingSenderId: "401622978834",
  appId: "1:401622978834:web:3116d0b0cb3491e68ea3cb",
  measurementId: "G-PP9LNECE4C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, db, doc, setDoc,
  getDoc, signOut, collection, serverTimestamp, updateDoc, addDoc, onSnapshot, query, orderBy, getDocs, where,
  deleteDoc
}