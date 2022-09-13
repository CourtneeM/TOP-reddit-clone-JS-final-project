import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

function RouteSwitch() {
  const [userList, setUserList] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [subList, setSubList] = useState({});
  const [topPosts, setTopPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    

    // const games = new Sub('Games', {uid: user2.uid, name: user2.name});
    // const digitalArt = new Sub('DigitalArt', {uid: user3.uid, name: user3.name});
    

    // user2.own.subs = [games.name];
    // user3.own.subs = [digitalArt.name];

    // Object.keys(newSubList).forEach((key) => {
    //   if (key === 'Games') {
    //     const owner = {uid: user4.uid, name: user4.name};
    //     const post1Uid = uniqid();
    //     const post2Uid = uniqid();
    //     newSubList[key].addPost(post1Uid, 'New Games Coming Soon', owner, 'text', 'Look at these cool games coming out later this year!', 'Games');
    //     newSubList[key].addPost(post2Uid, 'New Games Coming Next Year', owner, 'text', 'Look at these cool games coming out later this year!', 'Games');

    //     user4.own.posts[key] = [post1Uid, post2Uid];
    //   }
    //   if (key === 'DigitalArt') {
    //     const owner = { uid: user5.uid, name: user5.name };
    //     const post1Uid = uniqid();
    //     const post2Uid = uniqid();
    //     newSubList[key].addPost(post1Uid, 'Some cool art to look at', owner, 'text', 'Some cool art I found while browsing!', 'DigitalArt');
    //     newSubList[key].addPost(post2Uid, 'More art to check out', owner, 'text', 'Some cool art I found while browsing!', 'DigitalArt');

    //     user5.own.posts[key] = [post1Uid, post2Uid];
    //   }
    // });

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
            const { uid, title, owner, type, content, subName, creationDateTime, votes, upvotes, downvotes, editStatus, deleteStatus, comments } = existingPosts[postUid];
            existingSub.addPost(uid, title, owner, type, content, subName, creationDateTime, votes, upvotes, downvotes, editStatus, deleteStatus, comments);

            const post = existingSub.posts[postUid];
            const existingComments = post.comments;
            delete post.comments;
            post.comments = {};

            Object.keys(existingComments).forEach((commentUid) => {
              const { uid, postUid, subName, owner, text, parentUid, creationDateTime, votes, upvotes, downvotes, editStatus, deleteStatus, children } = existingComments[commentUid];
              post.addComment(uid, postUid, subName, owner, text, parentUid, creationDateTime, votes, upvotes, downvotes, editStatus, deleteStatus, children);
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
        setCurrentUser(newUserList.l80koqnn);
      }

      getSubList();
      getUserList();
    }
    
    getExistingData();
  }, []);

  useEffect(() => {
    setTopPosts([].concat.apply([], Object.keys(subList).map((key) => subList[key].getTopPosts())));
  }, [subList]);

  onAuthStateChanged(auth, (user) => {
    // user ? setLoggedIn(true) : setLoggedIn(false);
  });

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

    const editSubInFirestore = async () => {
      await updateDoc(doc(db, 'subs', editedSub.name), { ...sub });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
        moderator: userListCopy[currentUser.uid].moderator
      });
    }
    editSubInFirestore();
  }
  const deleteSub = (subName) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].own.subs.indexOf(subName);
    userListCopy[currentUser.uid].own.subs.splice(index, 1);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    delete subListCopy[subName];

    setSubList(subListCopy);

    const deleteFromFirestore = async () => {
      await deleteDoc(doc(db, 'subs', subName));
      await updateDoc(doc(db, 'users', currentUser.uid), { own: userListCopy[currentUser.uid].own });
    }

    deleteFromFirestore();
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

  const submitPost = (subName, postTitle, postContent, postType) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    const subListCopy = {...subList};
    const postUid = uniqid();
    subListCopy[subName].addPost(postUid, postTitle, owner, postType, postContent, subName);

    setSubList(subListCopy);

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].own.posts[subName]) userListCopy[currentUser.uid].own.posts[subName] = [];
    userListCopy[currentUser.uid].own.posts[subName].push(postUid);

    setUserList(userListCopy);

    const submitPostFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};
      });

      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts,
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
      });
      
      await updateDoc(doc(db, 'subs', editedPost.subName), {
        posts: allSubPosts
      });
    }
    editPostInFirestore();
  }
  const deletePost = (subName, postUid) => {
    const subListCopy = {...subList};
    const userListCopy = {...userList};
    const postOwnerUid = subListCopy[subName].posts[postUid].owner.uid;
    const index = userListCopy[postOwnerUid].own.posts[subName].indexOf(postUid);
    const deletedPost = userListCopy[postOwnerUid].own.posts[subName].splice(index, 1)[0];

    if (!userListCopy[postOwnerUid].deletedContent.posts[subName]) {
      userListCopy[postOwnerUid].deletedContent.posts[subName] = [];
    }
    userListCopy[postOwnerUid].deletedContent.posts[subName].push(deletedPost);

    setUserList(userListCopy);

    subListCopy[subName].posts[postUid].deleteText();
    
    setSubList(subListCopy);

    const deleteFromFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};
      });
      
      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts
      });
    }
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
      });
      
      await updateDoc(doc(db, 'subs', post.subName), {
        posts: allSubPosts
      });
    }
    editPostInFirestore();
  }
  const favoritePost = (subName, postUid) => {
    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].favorite.posts[subName]) userListCopy[currentUser.uid].favorite.posts[subName] = [];
    userListCopy[currentUser.uid].favorite.posts[subName].push(postUid);

    setUserList(userListCopy);
  }
  const unfavoritePost = (subName, postUid) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].favorite.posts[subName].indexOf(postUid);
    userListCopy[currentUser.uid].favorite.posts[subName].splice(index, 1);

    if (userListCopy[currentUser.uid].favorite.posts[subName].length === 0) delete userListCopy[currentUser.uid].favorite.posts[subName];


    setUserList(userListCopy);
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
    }

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
    }

    editCommentInFirestore();
  }
  const favoriteComment = (subName, postUid, commentUid) => {
    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].favorite.comments[subName]) userListCopy[currentUser.uid].favorite.comments[subName] = {};
    if (!userListCopy[currentUser.uid].favorite.comments[subName][postUid]) userListCopy[currentUser.uid].favorite.comments[subName][postUid] = [];
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].push(commentUid);

    setUserList(userListCopy);
  }
  const unfavoriteComment = (subName, postUid, commentUid) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].favorite.comments[subName][postUid].indexOf(commentUid);
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].splice(index, 1);

    if (userListCopy[currentUser.uid].favorite.comments[subName][postUid].length === 0) delete userListCopy[currentUser.uid].favorite.comments[subName];

    setUserList(userListCopy);
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} currentUser={currentUser} subList={subList} topPosts={topPosts} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} />} />
        <Route path="/r/all" element={<All loggedIn={loggedIn} currentUser={currentUser} subList={subList} favoritePost={favoritePost} unfavoritePost={unfavoritePost} />} />
        <Route path="/r/new_sub" element={<CreateSubPage loggedIn={loggedIn} currentUser={currentUser} subList={subList} createSub={createSub} />} />
        {
          <Route path={`/r/:subName`}>
            <Route index
              element={<SubPage
                loggedIn={loggedIn}
                currentUser={currentUser}
                userList={userList}
                subList={subList}
                followSub={followSub}
                unfollowSub={unfollowSub}
                favoritePost={favoritePost}
                unfavoritePost={unfavoritePost}
                adjustPostVotes={adjustPostVotes}
              />}
            />
            <Route key={uniqid()} path="edit_sub" element={<EditSubPage loggedIn={loggedIn} currentUser={currentUser} userList={userList} subList={subList} editSub={editSub} deleteSub={deleteSub} />} />
            <Route key={uniqid()} path="new_post" element={<CreatePostPage loggedIn={loggedIn} currentUser={currentUser} subList={subList} submitPost={submitPost} />} />
            <Route key={uniqid()} path=":postUid/:postTitle"
              element={<PostPage
                loggedIn={loggedIn}
                currentUser={currentUser}
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
              />}
            />
          </Route>
        }
        <Route path='/u/:userUid/:userName'
          element={<UserProfile
            loggedIn={loggedIn}
            currentUser={currentUser}
            userList={userList}
            subList={subList}
            adjustPostVotes={adjustPostVotes}
            adjustCommentVotes={adjustCommentVotes}
          />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;