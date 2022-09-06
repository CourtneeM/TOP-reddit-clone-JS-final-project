import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import User from './Components/Creation/User';
import Sub from './Components/Creation/Sub';

import Home from "./Components/Display/Home";
import All from './Components/Display/All';
import SubPage from './Components/Display/SubPage';
import PostPage from './Components/Display/PostPage';
import CreateSubPage from "./Components/Display/CreateSubPage";
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
    const user1 = new User(uniqid(), 'Bob', 'bobjones@hotmail.com');
    const user2 = new User(uniqid(), 'Kevin', 'kevinbarkley@gmail.com');
    const user3 = new User(uniqid(), 'Brenden', 'brendenparker@aol.com');
    const user4 = new User(uniqid(), 'Mike', 'mikehermit@gmail.com');
    const user5 = new User(uniqid(), 'Ricky', 'rickygalvez@yahoo.com');
    setUserList({
      [user1.uid]: user1,
      [user2.uid]: user2,
      [user3.uid]: user3,
      [user4.uid]: user4,
      [user5.uid]: user5,
    });
    setCurrentUser(user1);

    const games = new Sub('Games', user2);
    const digitalArt = new Sub('DigitalArt', user3);
    const newSubList = {[games.name]: games, [digitalArt.name]: digitalArt};

    Object.keys(newSubList).forEach((key) => {
      if (key === 'Games') {
        const owner = user4;
        newSubList[key].addPost(uniqid(), 'New Games Coming Soon', owner, 'text', 'Look at these cool games coming out later this year!', 'Games');
        newSubList[key].addPost(uniqid(), 'New Games Coming Next Year', owner, 'text', 'Look at these cool games coming out later this year!', 'Games');
      }
      if (key === 'DigitalArt') {
        const owner = user5;
        newSubList[key].addPost(uniqid(), 'Some cool art to look at', owner, 'text', 'Some cool art I found while browsing!', 'DigitalArt');
        newSubList[key].addPost(uniqid(), 'More art to check out', owner, 'text', 'Some cool art I found while browsing!', 'DigitalArt');
      }
    });

    setSubList(newSubList);
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
  }

  const followSub = (subName) => {
    const userListCopy = {...userList};
    userListCopy[currentUser.uid].followedSubs.push(subName);

    setUserList(userListCopy);
  }
  const unfollowSub = (subName) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].followedSubs.indexOf(subName);
    userListCopy[currentUser.uid].followedSubs.splice(index, 1);

    setUserList(userListCopy);
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
  }

  const deleteSub = (subName) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].own.subs.indexOf(subName);
    userListCopy[currentUser.uid].own.subs.splice(index, 1);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    delete subListCopy[subName];

    setSubList(subListCopy);
  }

  const deletePost = (subName, postUid) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].own.posts[subName].indexOf(postUid);
    userListCopy[currentUser.uid].own.posts[subName].splice(index, 1);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    delete subListCopy[subName].posts[postUid];
    
    setSubList(subListCopy);
  }
  
  const deleteComment = (comment) => {
    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].own.comments[comment.subName][comment.postUid].indexOf(comment.uid);
    userListCopy[currentUser.uid].own.comments[comment.subName][comment.postUid].splice(index, 1);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid].deleteText();

    setSubList(subListCopy);
  }

  const adjustPostVotes = (num, postUid, subName) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    
    subListCopy[subUid].posts[postUid].adjustVotes(num);
    setSubList(subListCopy);
  }
  const adjustCommentVotes = (num, commentUid, postUid, subName) => {
    const subListCopy = {...subList};
    subListCopy[subName].posts[postUid].comments[commentUid].adjustVotes(num);

    setSubList(subListCopy);
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
                subList={subList}
                followSub={followSub}
                unfollowSub={unfollowSub}
                deleteSub={deleteSub}
                favoritePost={favoritePost}
                unfavoritePost={unfavoritePost}
                adjustPostVotes={adjustPostVotes}
              />}
            />
              <Route key={uniqid()} path="new_post" element={<CreatePostPage loggedIn={loggedIn} currentUser={currentUser} subList={subList} submitPost={submitPost} />} />
              <Route key={uniqid()} path=":postUid/:postTitle"
                element={<PostPage
                  loggedIn={loggedIn}
                  currentUser={currentUser}
                  subList={subList}
                  favoritePost={favoritePost}
                  unfavoritePost={unfavoritePost}
                  deletePost={deletePost}
                  addComment={addComment}
                  favoriteComment={favoriteComment}
                  unfavoriteComment={unfavoriteComment}
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