import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://unboxing-200c8-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: 'gs://unboxing-200c8.appspot.com'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = firebase.database();
const storage = firebase.storage();
export default {db, storage};