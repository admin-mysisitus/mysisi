/**
 * FIREBASE CORE MODULE
 * ===================================
 * Ensures Firebase is loaded and initialized exactly once.
 * Prevents race conditions by returning a Promise that resolves 
 * to the Firebase instances (db, auth, storage).
 */
const firebaseConfig = {
  apiKey: "AIzaSyBkzS96QoH4nTcFOGDLMSkIbiKrkCUcA58",
  authDomain: "sisitus-project.firebaseapp.com",
  databaseURL: "https://sisitus-project-default-rtdb.firebaseio.com",
  projectId: "sisitus-project",
  storageBucket: "sisitus-project.firebasestorage.app",
  messagingSenderId: "802713479795",
  appId: "1:802713479795:web:0e1d6d3c84ec57bd5b5806"
};
let firebaseInitPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // If already exists in DOM, resolve
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Gagal memuat ${src}`));
    document.head.appendChild(script);
  });
}
export async function getFirebase() {
  // If already loaded and initialized, return immediately
  if (window.firebase && window.firebaseDB && window.firebaseAuth) {
    return {
      db: window.firebaseDB,
      auth: window.firebaseAuth,
      storage: window.firebaseStorage,
      firebase: window.firebase
    };
  }
  // If initialization is already in progress, wait for it
  if (!firebaseInitPromise) {
    firebaseInitPromise = (async () => {
      try {
        if (!window.firebase) {
          // Load app compat first
          await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
          // Load services in parallel
          await Promise.all([
            loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"),
            loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"),
            loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js")
          ]);
        }
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        // Expose globally for legacy components
        window.firebaseDB = window.firebase.database();
        window.firebaseStorage = window.firebase.storage();
        window.firebaseAuth = window.firebase.auth();
        // Polyfill the v9 modular functions using v8 compat SDK so we don't have to rewrite everything
        if (!window.firebaseHelpers) {
          window.firebaseHelpers = {
            ref: (dbInstance, path) => path ? dbInstance.ref(path) : dbInstance.ref(),
            onValue: (ref, callback, errorCallback) => {
              ref.on('value', callback, errorCallback);
              return () => ref.off('value', callback);
            },
            onChildAdded: (ref, callback) => {
              ref.on('child_added', callback);
              return () => ref.off('child_added', callback);
            },
            onChildChanged: (ref, callback) => {
              ref.on('child_changed', callback);
              return () => ref.off('child_changed', callback);
            },
            push: (ref) => ref.push(),
            set: (ref, value) => ref.set(value),
            serverTimestamp: () => window.firebase.database.ServerValue.TIMESTAMP,
            update: (ref, value) => ref.update(value),
            get: (ref) => ref.once('value'),
            remove: (ref) => ref.remove(),
            storageRef: (storageInstance, path) => storageInstance.ref(path),
            uploadBytesResumable: (ref, file) => ref.put(file),
            getDownloadURL: (ref) => ref.getDownloadURL()
          };
        }
        // Dispatch event for legacy scripts (like sendQueue.js)
        window.dispatchEvent(new Event('firebase-ready'));
        return {
          db: window.firebaseDB,
          auth: window.firebaseAuth,
          storage: window.firebaseStorage,
          firebase: window.firebase
        };
      } catch (error) {
        console.error('[Firebase Core] Initialization error:', error);
        firebaseInitPromise = null; // Reset so we can retry
        throw error;
      }
    })();
  }
  return firebaseInitPromise;
}