import { BrowserRouter, Routes, Route } from "react-router-dom";

import { PostProvider } from "./Components/Contexts/PostContext";
import { CommentProvider } from "./Components/Contexts/CommentContext";

import Home from "./Components/Display/Home/Home";
import All from './Components/Display/All/All';
import SubPage from './Components/Display/Sub/SubPage';
import CreateSubPage from "./Components/Display/CreateSubPage/CreateSubPage";
import EditSubPage from "./Components/Display/EditSubPage/EditSubPage";
import PostPage from './Components/Display/PostPage/PostPage';
import CreatePostPage from "./Components/Display/CreatePostPage/CreatePostPage";
import UserProfile from './Components/Display/UserProfile/UserProfilePage/UserProfilePage';

import uniqid from 'uniqid';

function RouteSwitch() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/all" element={<All />} />
        <Route path="/r/new_sub" element={<CreateSubPage />} />
        {
          <Route path={`/r/:subName`}>
            <Route index element={<SubPage />} />
            <Route key={uniqid()} path="edit_sub" element={<EditSubPage />} />
            <Route key={uniqid()} path="new_post"
              element={
                <PostProvider>
                  <CreatePostPage />
                </PostProvider>
              }
            />
            <Route key={uniqid()} path=":postUid/:postTitle"
              element={
                <PostProvider>
                  <CommentProvider>
                    <PostPage />
                  </CommentProvider>
                </PostProvider>
              }
            />
          </Route>
        }
        <Route path='/u/:userUid/:userName' element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;