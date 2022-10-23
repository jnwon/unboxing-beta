import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/storage";
import "firebase/compat/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyCKN3eHdU2OKYwP0iOyiVUrSPLVcKUw25c",
  authDomain: "unboxing-200c8.firebaseapp.com",
  databaseURL: "https://unboxing-200c8-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "unboxing-200c8",
  storageBucket: 'gs://unboxing-200c8.appspot.com',
  messagingSenderId: "1044515722353",
  appId: "1:1044515722353:web:941320bf35d5ea5ac637d0",
  measurementId: "G-NM4P1K4BQD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();
export default {db, storage, messaging};