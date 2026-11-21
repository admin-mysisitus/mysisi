const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, update, child } = require('firebase/database');
const firebaseConfig = {
  apiKey: "AIzaSyBkzS96QoH4nTcFOGDLMSkIbiKrkCUcA58",
  authDomain: "sisitus-project.firebaseapp.com",
  databaseURL: "https://sisitus-project-default-rtdb.firebaseio.com",
  projectId: "sisitus-project",
  storageBucket: "sisitus-project.firebasestorage.app",
  messagingSenderId: "802713479795",
  appId: "1:802713479795:web:0e1d6d3c84ec57bd5b5806"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rootDir = path.resolve(__dirname, '..');
const exportPath = path.join(rootDir, 'sisitus-project-default-rtdb-export.json');
const rulesPath = path.join(rootDir, 'firebase-rules.json');
async function checkStatus() {
  console.log('Menghubungi Firebase RTDB SISITUS...');
  const nodes = ['settings', 'packages', 'domains_pricing', 'addons', 'promos', 'orders', 'invoices', 'proposals', 'users'];
  const dbRef = ref(db);
  console.log('\nSTATUS KONEKSI & NODE DATA (LIVE):');
  console.log('==================================================');
  for (const n of nodes) {
    try {
      const snap = await get(child(dbRef, n));
      if (snap.exists()) {
        const val = snap.val();
        const count = Array.isArray(val) ? val.length : Object.keys(val).length;
        console.log(`  [${n.padEnd(16)}] AKTIF (${count} entri)`);
      } else {
        console.log(`  [${n.padEnd(16)}] KOSONG (0 entri)`);
      }
    } catch (e) {
      console.log(`  [${n.padEnd(16)}] TERKUNCI / RULE PROTECTED (${e.message})`);
    }
  }
  console.log('==================================================\n');
}
async function pullData() {
  console.log('Menyinkronkan data dari Firebase RTDB ke lokal...');
  const nodes = ['settings', 'packages', 'domains_pricing', 'addons', 'promos', 'orders', 'invoices', 'proposals', 'users', 'rooms', 'livechat_leads', 'tickets'];
  const dbRef = ref(db);
  let fullDb = {};
  if (fs.existsSync(exportPath)) {
    try {
      fullDb = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    } catch (e) {}
  }
  let pulled = 0;
  for (const n of nodes) {
    try {
      const snap = await get(child(dbRef, n));
      if (snap.exists()) {
        fullDb[n] = snap.val();
        pulled++;
        console.log(`  v Berhasil sinkron node: ${n}`);
      }
    } catch (e) {
      console.log(`  x Lewati node ${n} (rule protected / memerlukan auth): ${e.message}`);
    }
  }
  fs.writeFileSync(exportPath, JSON.stringify(fullDb, null, 2), 'utf8');
  console.log(`\nSinkronisasi selesai! ${pulled} node data disimpan di: ${path.basename(exportPath)}`);
}
async function pushNode(nodeName) {
  if (!nodeName) {
    console.error('Harap sebutkan nama node yang ingin di-push, contoh: node backend-tools/firebase-sync.js push packages');
    return;
  }
  if (!fs.existsSync(exportPath)) {
    console.error(`File ${path.basename(exportPath)} tidak ditemukan!`);
    return;
  }
  const fullDb = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  if (fullDb[nodeName] === undefined) {
    console.error(`Node ${nodeName} tidak ditemukan dalam file ekspor lokal!`);
    return;
  }
  try {
    const nodeRef = ref(db, nodeName);
    await set(nodeRef, fullDb[nodeName]);
    console.log(`Berhasil push node "${nodeName}" ke Firebase RTDB!`);
  } catch (e) {
    console.error(`Gagal push node "${nodeName}":`, e.message);
  }
}
async function main() {
  const args = process.argv.slice(2);
  const command = (args[0] || 'status').toLowerCase();
  if (command === 'status') {
    await checkStatus();
  } else if (command === 'pull' || command === 'backup' || command === 'sync') {
    await pullData();
    await checkStatus();
  } else if (command === 'push') {
    await pushNode(args[1]);
  } else {
    console.log(`
Petunjuk Penggunaan Sync Firebase:
  node backend-tools/firebase-sync.js status      Periksa status koneksi seluruh node database live
  node backend-tools/firebase-sync.js pull        Tarik data live terbaru ke sisitus-project-default-rtdb-export.json
  node backend-tools/firebase-sync.js push <node> Push data node tertentu dari lokal ke Firebase RTDB
    `);
  }
  process.exit(0);
}
main();
