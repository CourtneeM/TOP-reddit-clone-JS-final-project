import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, updateMetadata } from "firebase/storage";

import Navbar from "./Navbar";

import uniqid from 'uniqid';
import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1000px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 70px 0;
`;
const Header = styled.div`
  margin-bottom: 40px;
  font-size: 1.5rem;

  span { font-weight: bold; }
`;
const PostTypes = styled.div`
  display: flex;
  margin-bottom: -22px;

  p {
    padding: 8px 20px 30px;
    border-radius: 15px 15px 0 0;
    cursor: pointer;
  }

  #selected-post-type {
    background-color: #d9d9d9;
  }
`;
const PostContent = styled.div`
  position: relative;
  padding: 50px 140px;
  background-color: #d9d9d9;
  border-radius: 8px;

  div:first-child {
    margin-bottom: 30px;

    input {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
    }

    p {
      position: absolute;
      bottom: 60px;
      color: red;
    }
  }

  textarea, input:nth-child(2) {
    width: 100%;
    margin-bottom: 30px;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
  }

  textarea { resize: none; }

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
    padding: 7px 25px;
    background-color: #fff;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
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
  
  const submitPostHandler = async (e) => {
    const isFileTooLarge = (fileSize) => fileSize > (20 * 1024 * 1024);

    e.preventDefault();

    if (postTitle === '') return displayInputError('title');
    if ((postType === 'images/videos' && (postContent === '' || postContent === undefined)) || (postType === 'link' && postContent === '')) return displayInputError('post', 'empty');
    if (postType === 'images/videos' && isFileTooLarge(postContent.size)) return displayInputError('post', 'too large');
    if (postType === 'images/videos' && postContent['type'].split('/')[0] !== 'image' ) return displayInputError('post', 'not image');

    const postUid = uniqid();

    if (postType === 'images/videos') {
      const storageRef = ref(storage, `images/posts/${params.subName}/${postContent.name}-${postUid}`);
      await uploadImage(storageRef, postContent);
      
      getDownloadURL(storageRef).then((url) => {
        updateMetadata(storageRef, { customMetadata: { owner: currentUser.uid, subName: params.subName } });
        submitPost(params.subName, postUid, postTitle, storageRef._location.path_, postType);

        setPostTitle('');
        setPostContent('');
        navigate(`/r/${params.subName}`);
      }).catch((err) => {
        if (postContent['type'].split('/')[0] !== 'image') {
          displayInputError('post', 'not image');
          console.log('Error: File is not image', err);
        } else if (isFileTooLarge(postContent.size)) {
          displayInputError('post', 'too large');
          console.log('Error: Image too large', err);
        } else {
          displayInputError('post', 'general');
          console.log('Error uploading image', err);
        }
      });
    } else {
      submitPost(params.subName, postUid, postTitle, postContent, postType);
      
      setPostTitle('');
      setPostContent('');
      navigate(`/r/${params.subName}`);
    }
  }
  const displayInputError = (type, reason=null) => {
    const errorMsg = document.querySelector(`.${type}-error-msg`);

    if (type === 'title') errorMsg.textContent = 'Error: Post title cannot be empty';

    if (type === 'post') {
      if (reason === 'too large') {
        errorMsg.textContent = 'Error: File size too large. Max 20MB';
      } else if (reason === 'not image') {
        errorMsg.textContent = 'Error: File must be an image';
      } else if (reason === 'empty') {
        errorMsg.textContent = 'Error: Post content cannot be empty';
      } else {
        errorMsg.textContent = 'Error uploading image';
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
              <p>Create a Post in <span>r/{params.subName}</span></p>
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
              <SubmitPost>
                <button onClick={(e) => submitPostHandler(e)}>Post</button>
              </SubmitPost>
            </PostContent>
          </> :
          <p>You must be logged in to create a new post.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default CreatePostPage;