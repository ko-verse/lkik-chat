// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAelo6_0oMhbTnT0c_Tue1TfDvEi_kxSgs",
  authDomain: "lkik-chat.firebaseapp.com",
  projectId: "lkik-chat",
  storageBucket: "lkik-chat.appspot.com",
  messagingSenderId: "1035544060353",
  appId: "1:1035544060353:web:3f675d3f758ebfda228f40"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);