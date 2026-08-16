const firebaseConfig = {
  apiKey: "AIzaSyBkzS96QoH4nTcFOGDLMSkIbiKrkCUcA58",
  authDomain: "sisitus-project.firebaseapp.com",
  databaseURL: "https://sisitus-project-default-rtdb.firebaseio.com",
  projectId: "sisitus-project",
  storageBucket: "sisitus-project.firebasestorage.app",
  messagingSenderId: "802713479795",
  appId: "1:802713479795:web:0e1d6d3c84ec57bd5b5806"
};
// Initialize Firebase using the Compat SDK
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const storage = firebase.storage();
// Expose globally
window.firebaseDB = db;
window.firebaseStorage = storage;
// Polyfill the v9 modular functions using v8 compat SDK so we don't have to rewrite everything
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
  serverTimestamp: () => firebase.database.ServerValue.TIMESTAMP,
  update: (ref, value) => ref.update(value),
  get: (ref) => ref.once('value'),
  remove: (ref) => ref.remove(),
  storageRef: (storageInstance, path) => storageInstance.ref(path),
  uploadBytesResumable: (ref, file) => ref.put(file),
  getDownloadURL: (ref) => ref.getDownloadURL()
};
// Dispatch event so other scripts know Firebase is ready
window.dispatchEvent(new Event('firebase-ready'));