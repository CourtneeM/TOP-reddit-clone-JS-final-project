import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config';

import Sub from './Components/Creation/Sub';

import SubPage from './Components/Display/SubPage';
import Home from "./Components/Display/Home";
import PostPage from './Components/Display/PostPage';

import uniqid from 'uniqid';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);
const storage = getStorage(app);

function RouteSwitch() {
  const [subList, setSubList] = useState({});
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    const games = new Sub(uniqid(), 'Games', 'Best Place to Discuss Games', 'Kevin')
    const digitalArt = new Sub(uniqid(), 'Digital Art', 'Check out amazing digital art', 'Brenden')
    const newSubList = {[games.uid]: games, [digitalArt.uid]: digitalArt};

    Object.keys(newSubList).forEach((key) => {
      if (newSubList[key].name === 'Games') {
        newSubList[key].addPost(uniqid(), 'New Games Coming Soon', 'Mike', 'text', 'Look at these cool games coming out later this year!');
        newSubList[key].addPost(uniqid(), 'New Games Coming Next Year', 'Lenard', 'text', 'Look at these cool games coming out later this year!');
      }
      if (newSubList[key].name === 'Digital Art') {
        newSubList[key].addPost(uniqid(), 'Some cool art to look at', 'Ricky', 'text', 'Some cool art I found while browsing!');
        newSubList[key].addPost(uniqid(), 'More art to check out', 'Stan', 'text', 'Some cool art I found while browsing!');
      }
    });

    setSubList(newSubList);
  }, []);

  useEffect(() => {
    setTopPosts([].concat.apply([], Object.keys(subList).map((key) => subList[key].getTopPosts())));
    console.log(topPosts);
  }, [subList]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home topPosts={topPosts} />} />
        {
          Object.values(subList).map((sub) => {
            console.log(sub);
            return (
              <Route path={`/r/:subName`}>
                <Route index element={<SubPage subList={subList} />} />
                  <Route key={uniqid()} path=":postUid/:postTitle" element={<PostPage subList={subList} />} />
                {/* {
                  Object.values(sub.posts).map((post) => {
                    return <Route path={`${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`} element={<PostPage sub={sub} post={post} />} />
                  })
                } */}
              </Route>
            ) 
          })
        }
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;