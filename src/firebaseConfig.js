// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_3KUKMK04LoHcaNuLZS4uVOiFN1ipCEQ",
  authDomain: "imapmystudy.firebaseapp.com",
  projectId: "imapmystudy",
  storageBucket: "imapmystudy.appspot.com",
  messagingSenderId: "996461163130",
  appId: "1:996461163130:web:cced2c062a40d4c7adc1c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
