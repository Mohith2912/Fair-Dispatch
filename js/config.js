// FairDispatch fairdispatch.firebaseapp.com - COMPLETE CONFIG
const AppConfig = {
    appName: 'FairRoute AI',
    version: '2.1.1',
    
    mapConfig: {
        defaultCenter: [13.0827, 80.2707], // Chennai
        defaultZoom: 12
    },
    
    // YOUR EXACT FIREBASE CONFIG
    firebase: {
        apiKey: "AIzaSyAGbjQLv-7jFsawp9vM3GDu2gvTaXoF9Mo",
        authDomain: "fairdispatch.firebaseapp.com",
        databaseURL: "https://fairdispatch-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "fairdispatch",
        storageBucket: "fairdispatch.firebasestorage.app",
        messagingSenderId: "170891334109",
        appId: "1:170891334109:web:9ffb5cbb452e48a93aa634"
    }
};

// INIT FIREBASE
firebase.initializeApp(AppConfig.firebase);
window.db = firebase.database();
window.AppConfig = AppConfig;

console.log('✅ fairdispatch Firebase Connected!');
console.log('📱 Mobile+Web Ready');
