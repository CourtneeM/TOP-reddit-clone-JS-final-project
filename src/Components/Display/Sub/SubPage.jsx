import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { LogInOutContext } from '../../Contexts/LogInOutContext';
import PostPreview from "../PostPreview/PostPreview";
import AboutSection from "../About/AboutSection";
import Navbar from "../Navbar/Navbar";

import styles from './SubPage.module.css';
import { UserContext } from '../../Contexts/UserContext';

function SubPage({ subList, subActions, postActions, storage }) {
  const params = useParams();

  const [sub, setSub] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingSubInfo, setLoadingSubInfo] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const { loggedIn } = useContext(LogInOutContext);
  const { currentUser } = useContext(UserContext);

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
              <button onClick={() => subActions.unfollowSub(sub.name)}>Unfollow</button> :
              <button onClick={() => subActions.followSub(sub.name)}>Follow</button>
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
          <PostPreview post={post} favoritePost={postActions.favoritePost}
            unfavoritePost={postActions.unfavoritePost} adjustPostVotes={postActions.adjustPostVotes} storage={storage}
          />
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
      <Navbar subList={subList} currentSub={sub.name} />

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