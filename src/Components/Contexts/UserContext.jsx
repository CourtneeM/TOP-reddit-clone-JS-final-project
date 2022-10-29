import { createContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { uploadBytes } from "firebase/storage";
import { getFirebaseConfig } from '../../firebase-config';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userList, setUserList] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const getUserList = async () => {
      const newUserList = {};
      const querySnapshot = await getDocs(collection(db, 'users'));

      querySnapshot.forEach((doc) => newUserList[doc.data().uid] = doc.data());

      setUserList(newUserList);
    }

    getUserList();
  }, []);

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

  const uploadImage = async (storageRef, content) => {
    await uploadBytes(storageRef, content)
      .then((snapshot) => console.log('Uploaded image'))
      .catch((err) => console.log('error uploading image', err));
  }

  return (
    <UserContext.Provider value={{ userList, setUserList, currentUser, setCurrentUser, editUser, uploadImage }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };