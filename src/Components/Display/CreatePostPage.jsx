import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes } from "firebase/storage";

import Navbar from "./Navbar";

import uniqid from 'uniqid';
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

  div:first-child {
    position: relative;
    input {
      width: 100%;
      margin-bottom: 40px;
      padding: 10px;
      font-size: 1rem;
    }

    p {
      position: absolute;
      bottom: 13px;
      color: red;
    }
  }

  textarea, input:nth-child(2) {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
  }

  .post-error-msg {
    margin-top: 10px;
    color: red;
  }

  .hidden {
    display: none;
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

function CreatePostPage({ loggedIn, signInOut, currentUser, subList, submitPost, uploadImage, storage }) {
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
    const isFileTooLarge = (fileSize) => fileSize > 20971520;

    e.preventDefault();

    if (postTitle === '') return displayInputError('title');
    if ((postType === 'images/videos' && (postContent === '' || postContent === undefined)) || (postType === 'link' && postContent === '')) return displayInputError('post');
    if (postType === 'images/videos' && isFileTooLarge(postContent.size)) return displayInputError('post', 'too large');

    const postUid = uniqid();

    if (postType === 'images/videos') {
      const storageRef = ref(storage, `images/posts/${postContent.name}-${postUid}`);
      uploadImage(storageRef, postContent);
      submitPost(params.subName, postUid, postTitle, storageRef._location.path_, postType);
    } else {
      submitPost(params.subName, postUid, postTitle, postContent, postType);
    }
    navigate(`/r/${params.subName}`);
    
    setPostTitle('');
    setPostContent('');
  }
  const displayInputError = (type, reason=null) => {
    const errorMsg = document.querySelector(`.${type}-error-msg`);

    if (type === 'title') errorMsg.textContent = 'Error: Post title cannot be empty';

    if (type === 'post') {
      if (reason === 'too large') {
        errorMsg.textContent = 'Error: File size too large. Max 20MB';
      } else {
        errorMsg.textContent = 'Error: Post content cannot be empty';
      }
    }

    setTimeout(() => {
      errorMsg.classList.add('hidden');
    }, 5000);
    errorMsg.classList.remove('hidden');
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

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
                <p className='title-error-msg hidden'></p>
              </div>
              {
                postType === 'text' ? 
                <textarea name="post-content" id="post-content" cols="30" rows="10" placeholder="Text (optional)"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}>
                </textarea> :
                postType === 'images/videos' ?
                <input type="file" name="post-content" id="file-upload"
                  onChange={(e) => setPostContent(e.target.files[0])}
                /> :
                <input type="url" name="post-content" id="post-content" placeholder="URL"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              }
              <p className='post-error-msg hidden'></p>
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