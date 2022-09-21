import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject, uploadBytes, listAll } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';
import { getAuth, onAuthStateChanged, GoogleAuthProvider,  signInWithPopup, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";

import User from './Components/Creation/User';
import Sub from './Components/Creation/Sub';

import Home from "./Components/Display/Home";
import All from './Components/Display/All';
import SubPage from './Components/Display/SubPage';
import CreateSubPage from "./Components/Display/CreateSubPage";
import EditSubPage from "./Components/Display/EditSubPage";
import PostPage from './Components/Display/PostPage';
import CreatePostPage from "./Components/Display/CreatePostPage";
import UserProfile from './Components/Display/UserProfile/UserProfile';

import uniqid from 'uniqid';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function RouteSwitch() {
  const [userList, setUserList] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [subList, setSubList] = useState({});
  const [topPosts, setTopPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const getExistingData = () => {
      const getSubList = async () => {
        const newSubList = {};
        const querySnapshot = await getDocs(collection(db, 'subs'));
        querySnapshot.forEach((doc) => {
          const {name, owner, subTitle, moderators, followers, about, creationDateTime, posts} = doc.data();
          const existingSub = new Sub(name, owner, subTitle, moderators, followers, about, creationDateTime, posts);
          
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
      const getUserList = async () => {
        const newUserList = {};
        const querySnapshot = await getDocs(collection(db, 'users'));

        querySnapshot.forEach((doc) => newUserList[doc.data().uid] = doc.data());

        setUserList(newUserList);
      }

      getSubList();
      getUserList();
    }
    
    getExistingData();
  }, []);

  useEffect(() => {
    setTopPosts([].concat.apply([], Object.keys(subList).map((key) => subList[key].getTopPosts())));
  }, [subList]);

  useEffect(() => {
    if (Object.values(userList).length > 0 && auth.currentUser) {
      setCurrentUser(userList[auth.currentUser.uid]);
      setLoggedIn(true);
    }
  }, [userList, loggedIn])

  onAuthStateChanged(auth, (user) => {
    if (user && !loggedIn) {
      setLoggedIn(true);
      setCurrentUser(userList[user.uid]);
    } else if (!user && loggedIn) {
      setLoggedIn(false);
      setCurrentUser(null);
    }
  });

  const signInOut = (() => {
    const signUserIn = () => {
      setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return signInWithPopup(auth, provider)
          .then((res) => {
            const credential = GoogleAuthProvider.credentialFromResult(res);
            const token = credential.accessToken;
            const user = res.user;
            
            if (!userList[user.uid]) {
              const addUserToFirestore = async (newUser) => {
                await setDoc(doc(db, 'users', newUser.uid), {...newUser});
              }
              const userListCopy = {...userList};
              const profileImage = 'images/profiles/default-profile-image.png';
              userListCopy[user.uid] = new User(user.uid, user.displayName, user.email, profileImage)

              setUserList(userListCopy);
              setCurrentUser(userListCopy[user.uid]);
              addUserToFirestore(userListCopy[user.uid]);
            }
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
        setCurrentUser(null);
        console.log('sign out successful');
      })
      .catch((err) => {
        console.log('error signing out', err);
      });
    }

    return { signUserIn, signUserOut }
  })();

  const createSub = (subName) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    const subListCopy = {...subList};
    const newSub = new Sub(subName, owner);
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

    const [name, owner, subTitle, moderators, followers, about, creationDateTime, posts] = Object.values(sub);
    const editedSub = new Sub(name, owner, subTitle, moderators, followers, about, creationDateTime, posts);

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
  const uploadImage = async (storageRef, content) => {
    await uploadBytes(storageRef, content)
      .then((snapshot) => console.log('Uploaded image'))
      .catch((err) => console.log('error uploading image', err));
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

  const addComment = (commentText, postUid, subName, parentComment=null) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    let subListCopy = {...subList};
    const commentUid = uniqid();
    
    if (parentComment) {
      subListCopy[subName].posts[postUid].addComment(commentUid, postUid, subName, owner, commentText, parentComment.uid);
      parentComment.addChild(commentUid);
      } else {
      subListCopy[subName].posts[postUid].addComment(commentUid, postUid, subName, owner, commentText);
    }

    setSubList(subListCopy);

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].own.comments[subName]) userListCopy[currentUser.uid].own.comments[subName] = {};
    if (!userListCopy[currentUser.uid].own.comments[subName][postUid]) userListCopy[currentUser.uid].own.comments[subName][postUid] = [];

    userListCopy[currentUser.uid].own.comments[subName][postUid].push(commentUid);

    setUserList(userListCopy);

    const addCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        const post = {...subListCopy[subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
      });
    }

    addCommentInFirestore();
  }
  const editComment = (editedComment) => {
    const subListCopy = {...subList};
    subListCopy[editedComment.subName].posts[editedComment.postUid].comments[editedComment.uid].edit(editedComment.text);

    setSubList(subListCopy);

    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[editedComment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[editedComment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', editedComment.subName), {
        posts: allSubPosts,
      });
    }

    editCommentInFirestore();
  }
  const deleteComment = (comment) => {
    const deleteCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[comment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[comment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', comment.subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
      });
    }
    const editUsersInFirestore = () => {
      editedUsers.forEach(async (userUid) => {
        await updateDoc(doc(db, 'users', userUid), {
          favorite: userListCopy[userUid].favorite,
        });
      })
    }
    const removeFavoritesFromUser = () => {
      comment.favoritedBy.forEach((userUid) => {
        const index = userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].indexOf(comment.uid);
        userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].splice(index, 1);
        
        if (userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].length === 0) {
          delete userListCopy[userUid].favorite.comments[comment.subName][comment.postUid];
        }
        if (Object.values(userListCopy[userUid].favorite.comments[comment.subName]).length === 0) {
          delete userListCopy[userUid].favorite.comments[comment.subName];
        }

        editedUsers.push(userUid);
      });
    }

    const subListCopy = {...subList};
    const userListCopy = {...userList};
    const commentPath = subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid];
    const commentOwnerUid = commentPath.owner.uid;
    const index = userListCopy[commentOwnerUid].own.comments[comment.subName][comment.postUid].indexOf(comment.uid);

    const deletedComment = userListCopy[commentOwnerUid].own.comments[comment.subName][comment.postUid].splice(index, 1)[0];
    if (!userListCopy[commentOwnerUid].deletedContent.comments[comment.subName]) {
      userListCopy[commentOwnerUid].deletedContent.comments[comment.subName] = {};
    }
    if (!userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid]) {
      userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid] = [];
    }
    userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid].push(deletedComment);

    setUserList(userListCopy);

    commentPath.deleteText();
    setSubList(subListCopy);
    
    const editedUsers = [];
    removeFavoritesFromUser();
    editUsersInFirestore();

    deleteCommentInFirestore();
  }
  const adjustCommentVotes = (num, comment, currentUserCopy) => {
    const subListCopy = {...subList};
    subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid] = comment;
    subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid].adjustVotes(num);
    setSubList(subListCopy);

    const userListCopy = {...userList};
    userListCopy[currentUser.uid] = currentUserCopy;
    setUserList(userListCopy);

    setCurrentUser(currentUserCopy);

    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[comment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[comment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', comment.subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        votes: userListCopy[currentUser.uid].votes,
      });
    }

    editCommentInFirestore();
  }
  const favoriteComment = (subName, postUid, commentUid) => {
    const editCommentInFirestore = async () => {
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
        favorite: userListCopy[currentUser.uid].favorite,
      });
    }

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].favorite.comments[subName]) userListCopy[currentUser.uid].favorite.comments[subName] = {};
    if (!userListCopy[currentUser.uid].favorite.comments[subName][postUid]) userListCopy[currentUser.uid].favorite.comments[subName][postUid] = [];
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].push(commentUid);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.push(currentUser.uid);

    editCommentInFirestore();
  }
  const unfavoriteComment = (subName, postUid, commentUid) => {
    const editCommentInFirestore = async () => {
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
        favorite: userListCopy[currentUser.uid].favorite,
      });
    }

    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].favorite.comments[subName][postUid].indexOf(commentUid);
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].splice(index, 1);

    if (userListCopy[currentUser.uid].favorite.comments[subName][postUid].length === 0) {
      delete userListCopy[currentUser.uid].favorite.comments[subName][postUid];
    }
    if (Object.values(userListCopy[currentUser.uid].favorite.comments[subName]).length === 0) {
      delete userListCopy[currentUser.uid].favorite.comments[subName];
    }

    setUserList(userListCopy);

    const subListCopy = {...subList};
    const userUidIndex = subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.indexOf(currentUser.uid);
    subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.splice(userUidIndex, 1);

    editCommentInFirestore();
  }

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} topPosts={topPosts} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />}  />
        <Route path="/r/all" element={<All loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />} />
        <Route path="/r/new_sub" element={<CreateSubPage loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} createSub={createSub} />} />
        {
          <Route path={`/r/:subName`}>
            <Route index
              element={<SubPage
                loggedIn={loggedIn}
                signInOut={signInOut}
                currentUser={currentUser}
                userList={userList}
                subList={subList}
                followSub={followSub}
                unfollowSub={unfollowSub}
                favoritePost={favoritePost}
                unfavoritePost={unfavoritePost}
                adjustPostVotes={adjustPostVotes}
                storage={storage}
              />}
            />
            <Route key={uniqid()} path="edit_sub" element={<EditSubPage loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} userList={userList} subList={subList} editSub={editSub} deleteSub={deleteSub} />} />
            <Route key={uniqid()} path="new_post" element={<CreatePostPage loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} submitPost={submitPost} uploadImage={uploadImage} storage={storage} />} />
            <Route key={uniqid()} path=":postUid/:postTitle"
              element={<PostPage
                loggedIn={loggedIn}
                signInOut={signInOut}
                currentUser={currentUser}
                userList={userList}
                subList={subList}
                favoritePost={favoritePost}
                unfavoritePost={unfavoritePost}
                editPost={editPost}
                deletePost={deletePost}
                addComment={addComment}
                favoriteComment={favoriteComment}
                unfavoriteComment={unfavoriteComment}
                editComment={editComment}
                deleteComment={deleteComment}
                adjustPostVotes={adjustPostVotes}
                adjustCommentVotes={adjustCommentVotes}
                uploadImage={uploadImage}
                storage={storage}
              />}
            />
          </Route>
        }
        <Route path='/u/:userUid/:userName'
          element={<UserProfile
            loggedIn={loggedIn}
            signInOut={signInOut}
            currentUser={currentUser}
            userList={userList}
            subList={subList}
            adjustPostVotes={adjustPostVotes}
            adjustCommentVotes={adjustCommentVotes}
            editUser={editUser}
            uploadImage={uploadImage}
            storage={storage}
          />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;