const firebaseConfig = { apiKey: "AIzaSyC9csv8TECoXln6CiAhRoj2tBJ8p3-sN-0", authDomain: "musada-sd.firebaseapp.com", databaseURL: "https://musada-sd-default-rtdb.firebaseio.com", projectId: "musada-sd", storageBucket: "musada-sd.firebasestorage.app", messagingSenderId: "579185454529", appId: "1:579185454529:web:d131622d53d79211369340" };

let auth;
let db;
let _dbWarningShown = false;

try {
  if (firebaseConfig.apiKey !== 'API_KEY_ANDA_DISINI') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

function isDBReady() {
  if (!db) {
    if (!_dbWarningShown) {
      _dbWarningShown = true;
      console.warn('Database Firebase belum siap atau tidak terinisialisasi.');
    }
    return false;
  }
  return true;
}