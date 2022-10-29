import { createContext, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getFirebaseConfig } from '../../firebase-config';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userList, setUserList] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  const editUser = (profileImgPath) => {
    const editUserInFirestore = async () => {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileImage: profileImgPath,
      });
    }

    const userListCopy = {...userList};
    userListCopy[currentUser.uid].profileImage = profileImgPath;
    
    setUserList(userListCopy);
    setCurrentUser(userListCopy[currentUser.uid]);
    
    editUserInFirestore();
  }

  return (
    <UserContext.Provider value={{ userList, setUserList, currentUser, setCurrentUser, editUser }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };