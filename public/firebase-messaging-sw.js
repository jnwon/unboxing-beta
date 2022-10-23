// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyCKN3eHdU2OKYwP0iOyiVUrSPLVcKUw25c",
    authDomain: "unboxing-200c8.firebaseapp.com",
    databaseURL: "https://unboxing-200c8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "unboxing-200c8",
    storageBucket: "unboxing-200c8.appspot.com",
    messagingSenderId: "1044515722353",
    appId: "1:1044515722353:web:941320bf35d5ea5ac637d0",
    measurementId: "G-NM4P1K4BQD"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();