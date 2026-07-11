import { getAdminDb } from './app/lib/firebaseAdmin.js';

async function run() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('portfolio_content').limit(1).get();
    if (snap.empty) {
      console.log('No portfolio content found in Firestore.');
    } else {
      console.log('Portfolio content document:');
      console.log(JSON.stringify(snap.docs[0].data(), null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
