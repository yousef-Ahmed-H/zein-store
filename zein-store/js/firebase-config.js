// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyDwphad1gwVb0cXYJKZpmO90KNBjLs5U2g",
  authDomain: "zein-store-35fc1.firebaseapp.com",
  projectId: "zein-store-35fc1",
  storageBucket: "zein-store-35fc1.firebasestorage.app",
  messagingSenderId: "610992894504",
  appId: "1:610992894504:web:7541f060d4b9ef329f3b1d"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// ربط Firestore بالمشروع
window.db = firebase.firestore();