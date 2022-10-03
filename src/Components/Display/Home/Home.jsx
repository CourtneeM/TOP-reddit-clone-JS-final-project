import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import Navbar from "../Navbar/Navbar";
import PostPreview from "../PostPreview/PostPreview";

import styles from './Home.module.css';

function Home({ loggedIn, signInOut, currentUser, subList, topPosts, favoritePost, unfavoritePost, adjustPostVotes, storage }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (Object.values(topPosts).length !== 0) {
      setPosts(topPosts);
      console.log('Set Posts');
    }
  }, [topPosts]);
  useEffect(() => {
    setLoading(false);
  }, [posts])

  const sortPosts = (e) => {
    const postsCopy = [...posts];
    document.querySelector('.selected-sort').classList.remove('selected-sort', styles.selectedSort);
    e.target.classList.add('selected-sort', styles.selectedSort);

    if (e.target.textContent === 'Top') {
      postsCopy.sort((a, b) => Object.values(b)[0].votes - Object.values(a)[0].votes);
    }
    
    if (e.target.textContent === 'New') {
      postsCopy.sort((a, b) => {
        return Object.values(b)[0].creationDateTime.fullDateTime - Object.values(a)[0].creationDateTime.fullDateTime;
      });
    }

    setPosts(postsCopy);
  }
  const getPostPreview = () => {
    const existingPosts = posts.filter((post) => !Object.values(post)[0].deleteStatus.deleted);
    return existingPosts.map((post) => {
      const postDetails = Object.values(post)[0];
      const path = `/r/${postDetails.subName}/${postDetails.uid}/${postDetails.title.split(' ').join('_').toLowerCase()}`;

      return (
        <Link to={path} key={postDetails.uid} className='default-link'>
          <PostPreview key={postDetails.uid} loggedIn={loggedIn} currentUser={currentUser} post={postDetails} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />
        </Link>
      )
    });
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} currentSub={'Home'} />
      <div className={styles.wrapper}>
        <div className={styles.postsSection}>
          <div className={styles.sortOptions}>
            <ul>
              <li onClick={(e) => sortPosts(e)} className={`selected-sort ${styles.selectedSort}`}>Top</li>
              <li onClick={(e) => sortPosts(e)}>New</li>
            </ul>
          </div>

          <div>
            {
              loading ?
              <p>Loading...</p> :
              getPostPreview()
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;