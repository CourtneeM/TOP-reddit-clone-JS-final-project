import { useState, useEffect } from 'react';

import PostPreview from "../PostPreview/PostPreview";
import Navbar from "../Navbar/Navbar";

import styles from './All.module.css';

function All({ subList, postActions, storage}) {
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
          <PostPreview post={post} favoritePost={postActions.favoritePost}
            unfavoritePost={postActions.unfavoritePost} adjustPostVotes={postActions.adjustPostVotes} storage={storage}
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
      <Navbar subList={subList} currentSub={'All'} />
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