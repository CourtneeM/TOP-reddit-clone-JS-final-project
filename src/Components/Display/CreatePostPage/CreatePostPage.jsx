import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, updateMetadata } from "firebase/storage";

import Navbar from "../Navbar/Navbar";

import uniqid from 'uniqid';
import styles from './CreatePostPage.module.css';

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
    if (prevSelectedTypeEl) {
      prevSelectedTypeEl.removeAttribute('id');
      prevSelectedTypeEl.classList.remove(styles.selectedPostType);
    }

    console.log(e.target);
    e.target.id = 'selected-post-type';
    e.target.className = styles.selectedPostType;
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

      <div className={styles.wrapper}>
        { loggedIn ?
          <>
            <header>
              <p>Create a Post in <span>r/{params.subName}</span></p>
            </header>

            <div id='new-post-types' className={styles.postTypes}>
              <p id={`selected-post-type`} className={styles.selectedPostType} onClick={(e) => changePostType(e)}>Text</p>
              <p onClick={(e) => changePostType(e)}>Images/Videos</p>
              <p onClick={(e) => changePostType(e)}>Link</p>
            </div>

            <div className={styles.postContent}>
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
              <p className={`${styles.postErrorMsg} ${styles.hidden}`}></p>
              <div className={styles.submitPost}>
                <button onClick={(e) => submitPostHandler(e)}>Post</button>
              </div>
            </div>
          </> :
          <p>You must be logged in to create a new post.</p>
        }
          
      </div>
    </div>
  );
};

export default CreatePostPage;