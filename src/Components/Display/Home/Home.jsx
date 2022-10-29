import { useContext, useState, useEffect } from "react";
import { PostProvider } from "../../Contexts/PostContext";

import { SubContext } from "../../Contexts/SubContext";
import Navbar from "../Navbar/Navbar";
import PostPreview from "../PostPreview/PostPreview";

import styles from './Home.module.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { topPosts } = useContext(SubContext);

  useEffect(() => {
    if (Object.values(topPosts).length !== 0) {
      setPosts(topPosts);
      console.log('Set Posts');
    }
  }, [topPosts]);
  useEffect(() => {
    setLoading(false);
  }, [posts])

  const display = (() => {
    const sortOptions = () => {
      return (
        <div className={styles.sortOptions}>
          <ul>
            <li onClick={(e) => sortPosts(e)} className={`selected-sort ${styles.selectedSort}`}>Top</li>
            <li onClick={(e) => sortPosts(e)}>New</li>
          </ul>
        </div>
      );
    }
    const postPreview = () => {
      const existingPosts = posts.filter((post) => !Object.values(post)[0].deleteStatus.deleted);
      return existingPosts.map((post) => {
        const postDetails = Object.values(post)[0];
  
        return (
          <PostProvider>
            <PostPreview key={postDetails.uid} post={postDetails} />
          </PostProvider>
        )
      });
    }

    return { sortOptions, postPreview }
  })();
  
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

  return (
    <div>
      <Navbar currentSub={'Home'} />
      <div className={styles.wrapper}>
        <div className={styles.postsSection}>
          { display.sortOptions() }

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
}

export default Home;