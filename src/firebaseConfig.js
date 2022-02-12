import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyDwCeJ86fliwWLHZ1HIr1E-j5PsL_EiXNw",
    authDomain: "fir-tutorial-be017.firebaseapp.com",
    projectId: "fir-tutorial-be017",
    storageBucket: "fir-tutorial-be017.appspot.com",
    messagingSenderId: "997610046005",
    appId: "1:997610046005:web:e281d1ae2047ac5411e77c",
    measurementId: "G-QEHS567CB9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

export { db }
