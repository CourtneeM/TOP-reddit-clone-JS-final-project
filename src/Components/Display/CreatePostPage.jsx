import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  margin-bottom: 20px;
  padding: 20px 0;

  p:first-child {
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: bold;
  }
`;
const PostTypes = styled.div`
  display: flex;
  gap: 10px;

  p {
    cursor: pointer;
    padding: 5px 10px;
  }

  #selected-post-type {
    background-color: #ccc;
  }
`;
const PostContent = styled.div`
  margin: 60px auto 80px;
  padding: 0 40px;

  input:first-child {
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    font-size: 1rem;
  }

  textarea, input:nth-child(2) {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
  }
`;
const SubmitPost = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    padding: 7px 15px;
    cursor: pointer;
  }
`;

function CreatePostPage({ loggedIn, currentUser, subList, submitPost }) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('text');

  const params = useParams();
  const navigate = useNavigate();

  const changePostType = (e) => {
    setPostType(e.target.textContent.toLowerCase());
    setPostContent('');

    const prevSelectedTypeEl = document.querySelector('#new-post-types #selected-post-type');
    if (prevSelectedTypeEl) prevSelectedTypeEl.removeAttribute('id');

    e.target.id = 'selected-post-type';
  }

  const submitPostHandler = (e) => {
    e.preventDefault();

    submitPost(params.subName, postTitle, postContent, postType);
    navigate(`/r/${params.subName}`);
    
    setPostTitle('');
    setPostContent('');
  }

  return (
    <div>
      <Navbar currentUser={currentUser} subList={subList} />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Create a Post</p>
              <p>/r/{params.subName}</p>
            </Header>

            <PostTypes id='new-post-types'>
              <p id='selected-post-type' onClick={(e) => changePostType(e)}>Text</p>
              <p onClick={(e) => changePostType(e)}>Images/Videos</p>
              <p onClick={(e) => changePostType(e)}>Link</p>
            </PostTypes>

            <PostContent>
              <div>
                <input type="text" placeholder="Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                {
                  postType === 'text' ? 
                  <textarea name="post-content" id="post-content" cols="30" rows="10" placeholder="Text (optional)"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}>
                  </textarea> :
                  postType === 'images/videos' ?
                  <input type="file" name="post-content" id="post-content" /> :
                  <input type="url" name="post-content" id="post-content" placeholder="URL"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                }
              </div>

            </PostContent>

            <SubmitPost>
              <button onClick={(e) => submitPostHandler(e)}>Post</button>
            </SubmitPost>
          </> :
          <p>You must be logged in to create a new post.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default CreatePostPage;