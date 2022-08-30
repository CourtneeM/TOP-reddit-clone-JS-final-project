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
    const games = new Sub(uniqid(), 'Games', 'Best Place to Discuss Games', 'Kevin');
    const digitalArt = new Sub(uniqid(), 'Digital Art', 'Check out amazing digital art', 'Brenden');
    const newSubList = {[games.uid]: games, [digitalArt.uid]: digitalArt};

    Object.keys(newSubList).forEach((key) => {
      if (newSubList[key].name === 'Games') {
        newSubList[key].addPost(uniqid(), 'New Games Coming Soon', 'Mike', 'text', 'Look at these cool games coming out later this year!', 'Games', 1);
        newSubList[key].addPost(uniqid(), 'New Games Coming Next Year', 'Lenard', 'text', 'Look at these cool games coming out later this year!', 'Games', 2);
      }
      if (newSubList[key].name === 'Digital Art') {
        newSubList[key].addPost(uniqid(), 'Some cool art to look at', 'Ricky', 'text', 'Some cool art I found while browsing!', 'Digital Art', 2);
        newSubList[key].addPost(uniqid(), 'More art to check out', 'Stan', 'text', 'Some cool art I found while browsing!', 'Digital Art', 5);
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
    const newSub = new Sub(uniqid(), subName, 'Kevin');

    subListCopy[newSub.uid] = newSub;
    
    setSubList(subListCopy);
  }

  const submitPost = (subName, postTitle, postContent, postType) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    subListCopy[subUid].addPost(uniqid(), postTitle, 'ownerName', postType, postContent, subName, 2)

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
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;
    
    subListCopy[subUid].posts[postUid].comments[commentUid].adjustVotes(num);
    setSubList(subListCopy);
  }

  const addComment = (commentText, postUid, subName) => {
    const subListCopy = {...subList};
    const subUid = Object.values(subListCopy).filter((sub) => sub.name === subName)[0].uid;

    subListCopy[subUid].posts[postUid].addComment(uniqid(), 'ownerName', commentText, 1);
    setSubList(subListCopy);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} topPosts={topPosts} adjustPostVotes={adjustPostVotes} />} />
        <Route path="/r/all" element={<All loggedIn={loggedIn} subList={subList} />} />
        <Route path="/r/new_sub" element={<CreateSubPage loggedIn={loggedIn} createSub={createSub} />} />
        {
          <Route path={`/r/:subName`}>
            <Route index element={<SubPage loggedIn={loggedIn} subList={subList} adjustPostVotes={adjustPostVotes} />} />
              <Route key={uniqid()} path="new_post" element={<CreatePostPage loggedIn={loggedIn} submitPost={submitPost} />} />
              <Route key={uniqid()} path=":postUid/:postTitle"
                element={<PostPage
                  loggedIn={loggedIn}
                  subList={subList}
                  adjustPostVotes={adjustPostVotes}
                  adjustCommentVotes={adjustCommentVotes}
                  addComment={addComment}
                />}
              />
          </Route>
        }
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;