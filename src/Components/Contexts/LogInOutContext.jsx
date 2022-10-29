import { createContext, useState } from "react";
import User from '../Creation/User';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getFirebaseConfig } from '../../firebase-config';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const LogInOutContext = createContext();

const LogInOutProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const signUserIn = () => {
    setPersistence(auth, browserSessionPersistence)
    .then(() => {
      return signInWithPopup(auth, provider)
        .then((res) => {
          const credential = GoogleAuthProvider.credentialFromResult(res);
          const token = credential.accessToken;
          const user = res.user;
          
          // if (!userList[user.uid]) {
          //   const addUserToFirestore = async (newUser) => {
          //     await setDoc(doc(db, 'users', newUser.uid), {...newUser});
          //   }
          //   const userListCopy = {...userList};
          //   const profileImage = 'images/profiles/default-profile-image.png';
          //   userListCopy[user.uid] = new User(user.uid, user.displayName, user.email, profileImage)

          //   setUserList(userListCopy);
          //   setCurrentUser(userListCopy[user.uid]);
          //   addUserToFirestore(userListCopy[user.uid]);
          // }
        })
        .catch((err) => {
          console.log('error signing in', err.message);
        })
    })
    .catch((err) => {
      console.log('sign in persistence error', err)
    })
  }

  const signUserOut = () => {
    signOut(auth)
    .then(() => {
      setLoggedIn(false);
      // setCurrentUser(null);
      console.log('sign out successful');
    })
    .catch((err) => {
      console.log('error signing out', err);
    });
  }
  
  return (
    <LogInOutContext.Provider value={{ loggedIn, setLoggedIn, signUserIn, signUserOut }}>
      {children}
    </LogInOutContext.Provider>
  );
}

export { LogInOutContext, LogInOutProvider };