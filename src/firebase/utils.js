import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  addDoc,
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
    results.push(doc.data());
  });

  return [count, results];
}

export async function addSingleDocument(path, requestBody) {
  const docRef = await addDoc(collection(firebaseDB, path), requestBody);
  console.log(docRef);
  return docRef.id;
}
