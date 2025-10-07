import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccount || serviceAccount.length === 0) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not set");
}

const credential = cert(JSON.parse(serviceAccount));

// https://github.com/firebase/firebase-admin-node/issues/2111#issuecomment-1636441596
const existingApps = getApps();

const firebaseApp =
  getApps().length > 0
    ? existingApps[0]
    : initializeApp({ credential: credential }, "Epicdle");

const firestore = getFirestore(firebaseApp);

const firebaseStorage = getStorage(firebaseApp);

export { firestore, firebaseStorage };
