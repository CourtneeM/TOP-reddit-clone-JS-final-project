import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { LogInOutContext } from '../../Contexts/LogInOutContext';
import { UserContext } from '../../Contexts/UserContext';
import { SubContext } from '../../Contexts/SubContext';
import { PostProvider } from '../../Contexts/PostContext';

import PostPreview from "../PostPreview/PostPreview";
import AboutSection from "../About/AboutSection";
import Navbar from "../Navbar/Navbar";

import styles from './SubPage.module.css';

function SubPage() {
  const params = useParams();

  const [sub, setSub] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingSubInfo, setLoadingSubInfo] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const { loggedIn } = useContext(LogInOutContext);
  const { currentUser } = useContext(UserContext);
  const { subList, followSub, unfollowSub } = useContext(SubContext);

  useEffect(() => {
    if (Object.values(subList).length === 0) return;

    const currentSub = Object.values(subList).filter((sub) => {
      return sub.name === params.subName;
    })[0];

    setSub(currentSub);
    setPosts(Object.values(currentSub.posts));
  }, [subList, params.subName, sub.posts]);
  useEffect(() => {
    if (Object.values(sub).length === 0) return;
    setLoadingSubInfo(false);
  }, [sub]);
  useEffect(() => {
    setLoadingPosts(false);
  }, [posts]);

  const display = (() => {
    const subInfo = () => {
      return (
        <>
          <div>
            <p>{sub.subTitle}</p>
            <p>r/{sub.name}</p>
          </div>
          {
          loggedIn &&
          <div className={styles.followBtns}>
            {
              currentUser.followedSubs.includes(sub.name) ?
              <button onClick={() => unfollowSub(sub.name)}>Unfollow</button> :
              <button onClick={() => followSub(sub.name)}>Follow</button>
            }
          </div>
          }
        </>
      );
    }

    return { subInfo }
  })();

  const contentSection = () => {
    const displaySortOptions = () => {
      return (
        <div className={styles.sortOptions}>
          <ul>
            <li onClick={(e) => sortPosts(e)}>Top</li>
            <li onClick={(e) => sortPosts(e)} className='selected-sort'>New</li>
          </ul>
        </div>
      );
    }
    const sortPosts = (e) => {
      const postsCopy = [...posts];
      document.querySelector('.selected-sort').classList.remove('selected-sort', styles.selectedSort);
      e.target.classList.add('selected-sort', styles.selectedSort);
  
      if (e.target.textContent === 'Top') {
        postsCopy.sort((a, b) => b.votes - a.votes);
      }
      if (e.target.textContent === 'New') {
        postsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
      }
  
      setPosts(postsCopy);
    }
    const getPostPreview = () => {
      const existingPosts = Object.values(posts).filter((post) => !post.deleteStatus.deleted);
      return existingPosts.map((post) => {
  
        return (
          <PostProvider>
            <PostPreview key={post.uid} post={post} />
          </PostProvider>
        );
      });
    }

    return (
      <div className={styles.contentSection}>
        { displaySortOptions() }

        <div className={styles.postsContainer}>
          {
            loadingPosts ?
            <p>Loading...</p> :
            getPostPreview()
          }
        </div>
        {
          loadingSubInfo ?
          <p>Loading...</p> :  
          <AboutSection sub={sub} /> 
        }
      </div>
    );
  }

  return (
    <div>
      <Navbar currentSub={sub.name} />

      <div className={styles.wrapper}>
        <header>
          {
            loadingSubInfo ?
            <p>Loading...</p> :
            display.subInfo()
          }
        </header>

        { contentSection() }
      </div>
    </div>
  );
};

export default SubPage;