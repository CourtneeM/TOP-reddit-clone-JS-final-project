import { createContext, useContext } from "react";

import { UserContext } from "./UserContext";
import { SubContext } from "./SubContext";

import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject, uploadBytes } from "firebase/storage";
import { getFirebaseConfig } from '../../firebase-config';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);

const PostContext = createContext();

const PostProvider = ({ children }) => {
  const { userList, setUserList, currentUser, setCurrentUser } = useContext(UserContext);
  const { subList, setSubList } = useContext(SubContext);

  const submitPost = (subName, postUid, postTitle, postContent, postType) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    const subListCopy = {...subList};
    subListCopy[subName].addPost(postUid, postTitle, owner, postType, postContent, subName);
    setSubList(subListCopy);

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].own.posts[subName]) userListCopy[currentUser.uid].own.posts[subName] = [];
    userListCopy[currentUser.uid].own.posts[subName].push(postUid);

    setUserList(userListCopy);

    const submitPostFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        const postCopy = {...subListCopy[subName].posts[postUid]};
        Object.keys(subListCopy[subName].posts[postUid].comments).forEach((commentUid) => {
          postCopy.comments[commentUid] = {...postCopy.comments[commentUid]};
        });
        allSubPosts[postUid] = postCopy;
      });

      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
      });
    }

    submitPostFirestore();
  }

  const editPost = (editedPost) => {
    const subListCopy = {...subList};
    subListCopy[editedPost.subName].posts[editedPost.uid].edit(editedPost.content);

    setSubList(subListCopy);

    const editPostInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[editedPost.subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[editedPost.subName].posts[postUid]};

        const post = allSubPosts[postUid];
        const existingComments = post.comments;
        delete post.comments;
        post.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          post.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = post;
      });
      
      await updateDoc(doc(db, 'subs', editedPost.subName), {
        posts: allSubPosts
      });
    }
    editPostInFirestore();
  }
  
  const deletePost = (subName, postUid) => {
    const deleteFromFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};

        const post = allSubPosts[postUid];
        const existingComments = post.comments;
        delete post.comments;
        post.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          post.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = post;
      });
      
      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
        deletedContent: userListCopy[currentUser.uid].deletedContent
      });
    }
    const deleteFromStorage = () => {
      const imageRef = ref(storage, subListCopy[subName].posts[postUid].content);
      
      deleteObject(imageRef)
        .then(() => console.log('image deleted'))
        .catch((err) => console.log('error deleting image', err));
    }
    const editUsersInFirestore = () => {
      editedUsers.forEach(async (userUid) => {
        await updateDoc(doc(db, 'users', userUid), {
          favorite: userListCopy[userUid].favorite,
        });
      })
    }

    const subListCopy = {...subList};
    const userListCopy = {...userList};
    const postOwnerUid = subListCopy[subName].posts[postUid].owner.uid;
    const index = userListCopy[postOwnerUid].own.posts[subName].indexOf(postUid);

    const removeFavoritesFromUser = () => {
      Object.values(subList[subName].posts[postUid].comments).forEach((comment) => {
        comment.favoritedBy.forEach((userUid) => {
          if (userListCopy[userUid].favorite.comments[subName] &&
              userListCopy[userUid].favorite.comments[subName][postUid]) {
            delete userListCopy[userUid].favorite.comments[subName][postUid];

            if (Object.values(userListCopy[userUid].favorite.comments[subName]).length === 0) {
              delete userListCopy[userUid].favorite.comments[subName];
            }

            editedUsers.push(userUid);
          }
        });
      });
      subList[subName].posts[postUid].favoritedBy.forEach((userUid) => {
        const index = userListCopy[userUid].favorite.posts[subName].indexOf(postUid);
        userListCopy[userUid].favorite.posts[subName].splice(index, 1);
          
        if (userListCopy[userUid].favorite.posts[subName].length === 0) {
          delete userListCopy[userUid].favorite.posts[subName];
        }

        editedUsers.push(userUid);
      });
    }
    const editedUsers = [];
    removeFavoritesFromUser();

    if (subListCopy[subName].posts[postUid].type === 'images/videos') deleteFromStorage();

    const deletedPost = userListCopy[postOwnerUid].own.posts[subName].splice(index, 1)[0];

    if (!userListCopy[postOwnerUid].deletedContent.posts[subName]) {
      userListCopy[postOwnerUid].deletedContent.posts[subName] = [];
    }
    userListCopy[postOwnerUid].deletedContent.posts[subName].push(deletedPost);
    setUserList(userListCopy);

    subListCopy[subName].posts[postUid].deleteText();
    setSubList(subListCopy);

    editUsersInFirestore(editedUsers);
    deleteFromFirestore();
  }

  const adjustPostVotes = (num, post, currentUserCopy) => {
    const subListCopy = {...subList};
    subListCopy[post.subName].posts[post.uid].adjustVotes(num);
    setSubList(subListCopy);
    
    const userListCopy = {...userList};
    userListCopy[currentUserCopy.uid] = currentUserCopy;
    setUserList(userListCopy);

    setCurrentUser(currentUserCopy);

    const editPostInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[post.subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[post.subName].posts[postUid]};

        const existingPost = allSubPosts[postUid];
        const existingComments = existingPost.comments;
        delete existingPost.comments;
        existingPost.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          existingPost.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = existingPost;
      });
      
      await updateDoc(doc(db, 'subs', post.subName), {
        posts: allSubPosts
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        votes: userListCopy[currentUser.uid].votes,
      });
    }
    editPostInFirestore();
  }

  const favoritePost = (subName, postUid) => {
    const editInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};

        const post = allSubPosts[postUid];
        const existingComments = post.comments;
        delete post.comments;
        post.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          post.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = post;
      });
      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        favorite: userListCopy[currentUser.uid].favorite
      });
    }

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].favorite.posts[subName]) userListCopy[currentUser.uid].favorite.posts[subName] = [];
    userListCopy[currentUser.uid].favorite.posts[subName].push(postUid);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    subListCopy[subName].posts[postUid].favoritedBy.push(currentUser.uid);
    
    editInFirestore();
  }

  const unfavoritePost = (subName, postUid) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].favorite.posts[subName].indexOf(postUid);
    userListCopy[currentUser.uid].favorite.posts[subName].splice(index, 1);

    if (userListCopy[currentUser.uid].favorite.posts[subName].length === 0) {
      delete userListCopy[currentUser.uid].favorite.posts[subName];
    }

    setUserList(userListCopy);

    const editInFirestore = async () => {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        favorite: userListCopy[currentUser.uid].favorite
      });
    }
    editInFirestore();
  }

  const uploadImage = async (storageRef, content) => {
    await uploadBytes(storageRef, content)
      .then((snapshot) => console.log('Uploaded image'))
      .catch((err) => console.log('error uploading image', err));
  }

  return (
    <PostContext.Provider value={{ submitPost, editPost, deletePost, adjustPostVotes, favoritePost, unfavoritePost, uploadImage, storage }}>
      {children}
    </PostContext.Provider>
  );
}

export { PostContext, PostProvider };