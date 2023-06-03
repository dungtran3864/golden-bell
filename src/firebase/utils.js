import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";

export async function getSingleDocument(path, pathSegments) {
  const docRef = doc(firebaseDB, path, pathSegments);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}

export async function updateSingleDocument(path, pathSegments, requestBody) {
  const docRef = doc(firebaseDB, path, pathSegments);
  await updateDoc(docRef, requestBody);
}

export async function getMultipleDocuments(path, ...queryConstraints) {
  const q = query(collection(firebaseDB, path), ...queryConstraints);
  let count = 0;
  const results = [];

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    count++;
    results.push({ uid: doc.id, ...doc.data() });
  });

  return [count, results];
}

export async function addSingleDocument(path, requestBody) {
  const docRef = await addDoc(collection(firebaseDB, path), requestBody);
  return docRef.id;
}

export function onListenSingleDocumentRealTime(path, pathSegments, callback) {
  return onSnapshot(doc(firebaseDB, path, pathSegments), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
}

export function onListenMultipleDocumentsRealTime(
  path,
  callback,
  ...queryConstraints
) {
  const q = query(collection(firebaseDB, path), ...queryConstraints);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    let count = 0;
    const results = [];
    querySnapshot.forEach((doc) => {
      count++;
      results.push(doc.data());
    });
    callback(count, results);
  });
}

export async function makeTransaction(callback) {
  try {
    await runTransaction(firebaseDB, async (transaction) => {
      await callback(firebaseDB, transaction);
    });
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}
