import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getStorage }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyATLcrFZoSOGzKElhQccYi3NgdQeQSXiN0",
    authDomain: "kahaf-fashion.firebaseapp.com",
    projectId: "kahaf-fashion",
    storageBucket: "kahaf-fashion.firebasestorage.app",
    messagingSenderId: "474059202397",
    appId: "1:474059202397:web:1d93a8d8b1d3a559ca12b4"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);


console.log("Firebase connected!");

export {
    db,
    auth,
    storage
};