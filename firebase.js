// firebase.js
// Replace these with your actual Firebase Project settings.
const firebaseConfig = {
  apiKey: "AIzaSyBwID_A7VPexIBIeZQLjm9vus0gGNd6eEA",
  authDomain: "field-project-2f46c.firebaseapp.com",
  projectId: "field-project-2f46c",
  storageBucket: "field-project-2f46c.firebasestorage.app",
  messagingSenderId: "46336405026",
  appId: "1:46336405026:web:83899db0e3da57308e247b",
  measurementId: "G-ZPCHMNTXBG"
};

// Initialize Firebase variables
let app, auth, db;

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Initialize Analytics if the library is loaded
        if (firebase.analytics) {
            const analytics = firebase.analytics();
        }
        
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase not configured. Using mock data for demonstration.");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Listen for auth state changes if auth is initialized
if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged((user) => {
        if (!user && (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('students.html') || window.location.pathname.includes('courses.html') || window.location.pathname.includes('grades.html'))) {
            // Protect all dashboard routes
            window.location.href = 'login.html';
        }
    });
}
