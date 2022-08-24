const config = {
  apiKey: "AIzaSyBYu6nT0I3cfDj17we_Zh4FlfyAFmmx1vg",
  authDomain: "reddit-clone-final-js-project.firebaseapp.com",
  projectId: "reddit-clone-final-js-project",
  storageBucket: "reddit-clone-final-js-project.appspot.com",
  messagingSenderId: "349217069974",
  appId: "1:349217069974:web:7dd02d300ec5db47719bb7"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}