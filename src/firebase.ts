import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDJc5VTrqjJ-55cHB1vm8II-7XquFkL7TE",
  authDomain: "project-faruq.firebaseapp.com",
  databaseURL: "https://webtestmosa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webtestmosa",
  storageBucket: "webtestmosa.appspot.com",
  messagingSenderId: "615515289948",
  appId: "1:615515289948:web:669844edac97b5e743a999"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);