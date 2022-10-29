import { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import { getFirebaseConfig } from '../../firebase-config';

import Sub from '../Creation/Sub';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);

const SubContext = createContext();

const SubProvider = ({ children }) => {
  const [subList, setSubList] = useState({});
  const [topPosts, setTopPosts] = useState([]);

  const { userList, setUserList, currentUser } = useContext(UserContext);

  useEffect(() => {
    const getSubList = async () => {
      const newSubList = {};
      const querySnapshot = await getDocs(collection(db, 'subs'));
      querySnapshot.forEach((doc) => {
        const {name, owner, subTitle, about, moderators, followers, creationDateTime, posts} = doc.data();
        const existingSub = new Sub(name, owner, subTitle, about, moderators, followers, creationDateTime, posts);
        
        const existingPosts = existingSub.posts;
        delete existingSub.posts;
        existingSub.posts = {};
        Object.keys(existingPosts).forEach((postUid) => {
          const { uid, title, owner, type, content, subName, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, comments } = existingPosts[postUid];
          existingSub.addPost(uid, title, owner, type, content, subName, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, comments);

          const post = existingSub.posts[postUid];
          const existingComments = post.comments;
          delete post.comments;
          post.comments = {};

          Object.keys(existingComments).forEach((commentUid) => {
            const { uid, postUid, subName, owner, text, parentUid, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, children } = existingComments[commentUid];
            post.addComment(uid, postUid, subName, owner, text, parentUid, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, children);
          });

          existingSub.posts[postUid] = post;
        });

        newSubList[existingSub.name] = existingSub;
      });

      setSubList(newSubList);
    }

    getSubList();
  }, [])

  useEffect(() => {
    setTopPosts([].concat.apply([], Object.keys(subList).map((key) => subList[key].getTopPosts())));
  }, [subList]);

  const createSub = (subName, subtitle=null, subAbout=null) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    const subListCopy = {...subList};
    const newSub = new Sub(subName, owner, subtitle, subAbout);
    subListCopy[newSub.name] = newSub;

    setSubList(subListCopy);

    const userListCopy = {...userList};
    userListCopy[currentUser.uid].own.subs.push(subName);

    setUserList(userListCopy);

    const addToFirestore = async () => {
      await setDoc(doc(db, 'subs', subName), { ...newSub });
      await updateDoc(doc(db, 'users', currentUser.uid), { own: userListCopy[currentUser.uid].own });
    }

    addToFirestore();
  }

  const editSub = (sub, removedMods) => {
    const editSubInFirestore = async () => {
      await updateDoc(doc(db, 'subs', editedSub.name), { ...sub });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
        moderator: userListCopy[currentUser.uid].moderator
      });
    }

    const subListCopy = {...subList};

    const [name, owner, subTitle, about, moderators, followers, creationDateTime, posts] = Object.values(sub);
    const editedSub = new Sub(name, owner, subTitle, about, moderators, followers, creationDateTime, posts);

    subListCopy[sub.name] = editedSub;

    setSubList(subListCopy);

    const userListCopy = {...userList};
    moderators.forEach((modUid) => {
      if (!userListCopy[modUid].moderator.includes(name)) {
        userListCopy[modUid].moderator.push(name);
      }
    });

    removedMods.forEach((removedModUid) => {
      const index = userListCopy[removedModUid].moderator.indexOf(name);
      userListCopy[removedModUid].moderator.splice(index, 1);
    });

    setUserList(userListCopy);
    editSubInFirestore();
  }

  const deleteSub = (subName) => {
    const deleteFromFirestore = async () => {
      await deleteDoc(doc(db, 'subs', subName));
      await updateDoc(doc(db, 'users', currentUser.uid), { own: userListCopy[currentUser.uid].own });
    }
    const deleteFromStorage = async () => {
      const subRef = ref(storage, `images/posts/${subName}`);
      listAll(subRef)
        .then((res) => {
          res.items.forEach(async (item) => {
            await deleteObject(item)
              .then(() => console.log('Image deleted'))
              .catch((err) => console.log('error deleting image', err));
          });
        });
    }
    const editUsersInFirestore = () => {
      editedUsers.forEach(async (userUid) => {
        await updateDoc(doc(db, 'users', userUid), {
          followedSubs: userListCopy[userUid].followedSubs,
        });
      })
    }

    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].own.subs.indexOf(subName);
    userListCopy[currentUser.uid].own.subs.splice(index, 1);

    const removeFollowedSubFromUsers = () => {
      subList[subName].followers.forEach((followerUid) => {
        const index = userListCopy[followerUid].followedSubs.indexOf(subName);
        userListCopy[followerUid].followedSubs.splice(index, 1);
        editedUsers.push(followerUid);
      });
    }
    const removeFavoritesFromUsers = () => {
      Object.values(subList[subName].posts).forEach((post) => {
        Object.values(post.comments).forEach((comment) => {
          comment.favoritedBy.forEach((userUid) => {
            const index = userListCopy[userUid].favorite.comments[subName][post.uid].indexOf(comment.uid);
            userListCopy[userUid].favorite.comments[subName][post.uid].splice(index, 1);
            
            if (userListCopy[userUid].favorite.comments[subName][post.uid].length === 0) {
              delete userListCopy[userUid].favorite.comments[subName][post.uid];
            }
            if (Object.values(userListCopy[userUid].favorite.comments[subName]).length === 0) {
              delete userListCopy[userUid].favorite.comments[subName];
            }

            editedUsers.push(userUid);
          });
        });

        post.favoritedBy.forEach((userUid) => {
          delete userListCopy[userUid].favorite.posts[subName];
          if (userListCopy[userUid].favorite.posts[subName].length === 0) {
            delete userListCopy[userUid].favorite.posts[subName];
          }

          editedUsers.push(userUid);
        });
      })
    }
    const removeOwnedFromUsers = () => {
      Object.values(subList[subName].posts).forEach((post) => {
        Object.values(post.comments).forEach((comment) => {
          const commentIndex = userListCopy[comment.owner.uid].own.comments[subName][comment.postUid].indexOf(comment.uid);
          userListCopy[comment.owner.uid].own.comments[subName][post.uid].splice(commentIndex, 1);
          if (Object.values(userListCopy[comment.owner.uid].own.comments[subName][post.uid]).length === 0) {
            delete userListCopy[comment.owner.uid].own.comments[subName][post.uid];
          }
          if (Object.values(userListCopy[comment.owner.uid].own.comments[subName]).length === 0) {
            delete userListCopy[comment.owner.uid].own.comments[subName];
          }

          editedUsers.push(comment.owner.uid);
        });
        
        const postIndex = userListCopy[post.owner.uid].own.posts[subName].indexOf(post.uid);
        userListCopy[post.owner.uid].own.posts[subName].splice(postIndex, 1);
        if (Object.values(userListCopy[post.owner.uid].own.posts[subName]).length === 0) {
          delete userListCopy[post.owner.uid].own.posts[subName];
        }

        editedUsers.push(post.owner.uid);
      });
    }

    const editedUsers = [];
    removeFollowedSubFromUsers();
    removeFavoritesFromUsers();
    removeOwnedFromUsers();

    setUserList(userListCopy);

    const subListCopy = {...subList};
    delete subListCopy[subName];

    setSubList(subListCopy);

    editUsersInFirestore(editedUsers);
    deleteFromFirestore();
    deleteFromStorage();
  }

  const followSub = (subName) => {
    const subListCopy = {...subList};
    subListCopy[subName].followers.push(currentUser.uid);

    setSubList(subListCopy);

    const userListCopy = {...userList};
    userListCopy[currentUser.uid].followedSubs.push(subName);

    setUserList(userListCopy);

    const editSubInFirestore = async () => {
      await updateDoc(doc(db, 'subs', subName), {
        followers: subListCopy[subName].followers,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        followedSubs: userListCopy[currentUser.uid].followedSubs,
      });
    }
    editSubInFirestore();
  }

  const unfollowSub = (subName) => {
    const subListCopy = {...subList};
    const userIndex = subListCopy[subName].followers.indexOf(currentUser.uid);
    subListCopy[subName].followers.splice(userIndex, 1);

    setSubList(subListCopy);

    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].followedSubs.indexOf(subName);
    userListCopy[currentUser.uid].followedSubs.splice(index, 1);

    setUserList(userListCopy);

    const editSubInFirestore = async () => {
      await updateDoc(doc(db, 'subs', subName), {
        followers: subListCopy[subName].followers,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        followedSubs: userListCopy[currentUser.uid].followedSubs,
      });
    }
    editSubInFirestore();
  }
  
  return (
    <SubContext.Provider value={{ subList, setSubList, topPosts, createSub, editSub, deleteSub, followSub, unfollowSub, storage }}>
      {children}
    </SubContext.Provider>
  );
}

export { SubContext, SubProvider };