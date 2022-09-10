import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY?.trim(),
	authDomain: process.env.REACT_APP_AUTH_DOMAIN?.trim(),
	projectId: process.env.REACT_APP_PROJECT_ID?.trim(),
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET?.trim(),
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID?.trim(),
	appId: process.env.REACT_APP_APP_ID?.trim(),
	measurementId: process.env.REACT_APP_MEASUREMENT_ID?.trim(),
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const auth = getAuth(app);

export { db, auth };
