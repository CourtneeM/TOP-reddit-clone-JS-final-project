import { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage, uploadBytes } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { LogInOutContext } from "./Components/Contexts/LogInOutContext";
import { UserContext } from "./Components/Contexts/UserContext";
import { SubContext } from "./Components/Contexts/SubContext";

import Sub from './Components/Creation/Sub';

import Home from "./Components/Display/Home/Home";
import All from './Components/Display/All/All';
import SubPage from './Components/Display/Sub/SubPage';
import CreateSubPage from "./Components/Display/CreateSubPage/CreateSubPage";
import EditSubPage from "./Components/Display/EditSubPage/EditSubPage";
import PostPage from './Components/Display/PostPage/PostPage';
import CreatePostPage from "./Components/Display/CreatePostPage/CreatePostPage";
import UserProfile from './Components/Display/UserProfile/UserProfilePage/UserProfilePage';

import uniqid from 'uniqid';
import { PostProvider } from "./Components/Contexts/PostContext";

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

function RouteSwitch() {
  const { loggedIn, setLoggedIn } = useContext(LogInOutContext);
  const { userList, setUserList, currentUser, setCurrentUser } = useContext(UserContext);
  const { subList, setSubList } = useContext(SubContext);

  useEffect(() => {
    const getExistingData = () => {
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
    if (Object.values(userList).length > 0 && auth.currentUser) {
      setCurrentUser(userList[auth.currentUser.uid]);
      setLoggedIn(true);
    }
  }, [userList, loggedIn])

  // onAuthStateChanged(auth, (user) => {
  //   if (user && !loggedIn) {
  //     setLoggedIn(true);
  //     setCurrentUser(userList[user.uid]);
  //   } else if (!user && loggedIn) {
  //     setLoggedIn(false);
  //     setCurrentUser(null);
  //   }
  // });

  

  

  const commentActions = (() => {
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

    return { addComment, editComment, deleteComment, adjustCommentVotes, favoriteComment, unfavoriteComment }
  })();
  
  const uploadImage = async (storageRef, content) => {
    await uploadBytes(storageRef, content)
      .then((snapshot) => console.log('Uploaded image'))
      .catch((err) => console.log('error uploading image', err));
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home storage={storage} />} />
        <Route path="/r/all" element={<All storage={storage} />} />
        <Route path="/r/new_sub" element={<CreateSubPage />} />
        {
          <Route path={`/r/:subName`}>
            <Route index element={<SubPage storage={storage} />} />
            <Route key={uniqid()} path="edit_sub" element={<EditSubPage />} />
            <Route key={uniqid()} path="new_post"
              element={
                <PostProvider>
                  <CreatePostPage uploadImage={uploadImage} storage={storage} />
                </PostProvider>
              }
            />
            <Route key={uniqid()} path=":postUid/:postTitle"
              element={
                <PostProvider>
                  <PostPage commentActions={commentActions} uploadImage={uploadImage} storage={storage} />
                </PostProvider>
              }
            />
          </Route>
        }
        <Route path='/u/:userUid/:userName' element={<UserProfile commentActions={commentActions} uploadImage={uploadImage} storage={storage} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;