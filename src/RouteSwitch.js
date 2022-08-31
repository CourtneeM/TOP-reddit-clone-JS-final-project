import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Sub from './Components/Creation/Sub';

import Home from "./Components/Display/Home";
import All from './Components/Display/All';
import SubPage from './Components/Display/SubPage';
import PostPage from './Components/Display/PostPage';
import CreatePostPage from "./Components/Display/CreatePostPage";

import uniqid from 'uniqid';
import CreateSubPage from "./Components/Display/CreateSubPage";

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

function RouteSwitch() {
  const [subList, setSubList] = useState({});
  const [topPosts, setTopPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    const games = new Sub(uniqid(), 'Games', 'Kevin');
    const digitalArt = new Sub(uniqid(), 'DigitalArt', 'Brenden');
    const newSubList = {[games.uid]: games, [digitalArt.uid]: digitalArt};

    Object.keys(newSubList).forEach((key) => {
      if (newSubList[key].name === 'Games') {
        newSubList[key].addPost(uniqid(), 'New Games Coming Soon', 'Mike', 'text', 'Look at these cool games coming out later this year!', 'Games');
        newSubList[key].addPost(uniqid(), 'New Games Coming Next Year', 'Lenard', 'text', 'Look at these cool games coming out later this year!', 'Games');
      }
      if (newSubList[key].name === 'DigitalArt') {
        newSubList[key].addPost(uniqid(), 'Some cool art to look at', 'Ricky', 'text', 'Some cool art I found while browsing!', 'DigitalArt');
        newSubList[key].addPost(uniqid(), 'More art to check out', 'Stan', 'text', 'Some cool art I found while browsing!', 'DigitalArt');
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
    const subListCopy = {...subList};
    const newSub = new Sub(uniqid(), subName, 'ownerName');

    subListCopy[newSub.uid] = newSub;

    setSubList(subListCopy);
  }

  const submitPost = (subName, postTitle, postContent, postType) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    subListCopy[subUid].addPost(uniqid(), postTitle, 'ownerName', postType, postContent, subName, 2)

    setSubList(subListCopy);
  }

  const addComment = (commentText, postUid, subName, parentComment) => {
    let subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;

    const commentUid = uniqid();

    if (parentComment) {
      parentComment.addChild(commentUid, 'ownerName', commentText);
      subListCopy = {...subList};
    } else {
      subListCopy[subUid].posts[postUid].addComment(commentUid, 'ownerName', commentText);
    }

    setSubList(subListCopy);
  }

  const deleteSub = (subOwnerUid) => {
    // if subOwnerUid matches current user uid, then delete
    console.log('delete sub');
  }

  const deletePost = (postOwnerUid) => {
    // if postOwnerUid matches current user uid, then delete
    console.log('delete post');
  }
  
  const deleteComment = (commentOwnerUid) => {
    // if commentOwnerUid matches current user uid, then delete
    console.log('delete comment');
  }

  const adjustPostVotes = (num, postUid, subName) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    
    subListCopy[subUid].posts[postUid].adjustVotes(num);
    setSubList(subListCopy);
  }

  const adjustCommentVotes = (num, commentUid, postUid, subName) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    
    subListCopy[subUid].posts[postUid].comments[commentUid].adjustVotes(num);
    setSubList(subListCopy);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} subList={subList} topPosts={topPosts} adjustPostVotes={adjustPostVotes} />} />
        <Route path="/r/all" element={<All loggedIn={loggedIn} subList={subList} />} />
        <Route path="/r/new_sub" element={<CreateSubPage loggedIn={loggedIn} subList={subList} createSub={createSub} />} />
        {
          <Route path={`/r/:subName`}>
            <Route index element={<SubPage loggedIn={loggedIn} subList={subList} adjustPostVotes={adjustPostVotes} deleteSub={deleteSub} />} />
              <Route key={uniqid()} path="new_post" element={<CreatePostPage loggedIn={loggedIn} subList={subList} submitPost={submitPost} />} />
              <Route key={uniqid()} path=":postUid/:postTitle"
                element={<PostPage
                  loggedIn={loggedIn}
                  subList={subList}
                  addComment={addComment}
                  deletePost={deletePost}
                  deleteComment={deleteComment}
                  adjustPostVotes={adjustPostVotes}
                  adjustCommentVotes={adjustCommentVotes}
                />}
              />
          </Route>
        }
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;