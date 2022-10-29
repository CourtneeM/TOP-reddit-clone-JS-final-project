import { createContext, useState } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userList, setUserList] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  return (
    <UserContext.Provider value={{ userList, setUserList, currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };