import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  apiKey: process.env.FIREBASE_API || '',
  authDomain: 'rizafahmicom-hits.firebaseapp.com',
  databaseURL: 'https://rizafahmicom-hits.firebaseio.com',
  projectId: 'rizafahmicom-hits',
  storageBucket: 'rizafahmicom-hits.appspot.com',
  messagingSenderId: '1073468967615'
};
firebase.initializeApp(config);

export default firebase;
export const database = firebase.database();
