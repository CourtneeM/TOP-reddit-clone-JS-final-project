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
  const games = new Sub(uniqid(), 'Games', 'Best Place to Discuss Games', 'Kevin')
  const digitalArt = new Sub(uniqid(), 'Digital Art', 'Check out amazing digital art', 'Brenden')
  const subList = {[games.uid]: games, [digitalArt.uid]: digitalArt};

  Object.keys(subList).forEach((key) => {
    if (subList[key].name === 'Games') {
      subList[key].addPost(uniqid(), 'New Games Coming Soon', 'Mike', 'text', 'Look at these cool games coming out later this year!');
      subList[key].addPost(uniqid(), 'New Games Coming Soon', 'Lenard', 'text', 'Look at these cool games coming out later this year!');
    }
    if (subList[key].name === 'Digital Art') {
      subList[key].addPost(uniqid(), 'Cool art to look at', 'Ricky', 'text', 'Some cool art I found while browsing!');
      subList[key].addPost(uniqid(), 'Cool art to look at', 'Stan', 'text', 'Some cool art I found while browsing!');
    }
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home subList={subList} />} />
        {
          Object.values(subList).map((sub) => {
            return (
              <Route path={`/r/${sub.name.split(' ').join('_').toLowerCase()}`}>
                <Route index="true" element={<SubPage sub={sub}/>} />
                {
                  Object.values(sub.posts).map((post) => {
                    return <Route path={`${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`} element={<PostPage sub={sub} post={post} />} />
                  })
                }
              </Route>
            ) 
          })
        }
        {/* <Route path="/post"> */}
          {
            // console.log([].concat.apply([], Object.values(subList).map((sub) => {
            //   return Object.values(sub.posts).map((post) => {
            //     return <Route path={`${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`} element={<PostPage />} />
            //   })
            // })))
          }
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;