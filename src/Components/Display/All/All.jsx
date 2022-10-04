import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PostPreview from "../PostPreview/PostPreview";
import Navbar from "../Navbar/Navbar";

import styles from './All.module.css';

function All({ loggedIn, signInOut, currentUser, subList, favoritePost, unfavoritePost, adjustPostVotes, storage}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPosts([].concat.apply([], Object.values(subList).map((sub) => Object.values(sub.posts))));
  }, [subList]);
  useEffect(() => {
    setLoading(false);
  }, [posts]);

  const display = (() => {
    const sortOptions = () => {
      return (
        <ul>
          <li onClick={(e) => sortPosts(e)}>Top</li>
          <li onClick={(e) => sortPosts(e)}>New</li>
        </ul>
      );
    }
    const postPreview = () => {
      const existingPosts = posts.filter((post) => !post.deleteStatus.deleted);
      return existingPosts.map((post) => {

        return (
          <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={post} favoritePost={favoritePost}
            unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage}
          />
        );
      });
    }

    return { sortOptions, postPreview }
  })();
  
  const sortPosts = (e) => {
    const postsCopy = [...posts];
    if (document.querySelector('.selected-sort')) document.querySelector('.selected-sort').classList.remove('selected-sort', styles.selectedSort);
    e.target.classList.add('selected-sort', styles.selectedSort);

    if (e.target.textContent === 'Top') {
      postsCopy.sort((a, b) => b.votes - a.votes);
    }
    
    if (e.target.textContent === 'New') {
      postsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
    }

    setPosts(postsCopy);
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} currentSub={'All'} />
      <div className={styles.wrapper}>
        
        <div className={styles.postsSection}>
          <div className={styles.sortOptions}>
            { display.sortOptions() }
          </div>


          <div>
            {
              loading ?
              <p>Loading...</p> :
              display.postPreview()
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default All;