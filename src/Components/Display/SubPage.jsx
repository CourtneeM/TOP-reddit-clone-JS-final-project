import { useParams, Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";
import Navbar from "./Navbar";

import styled from "styled-components";
import { useEffect, useState } from 'react';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1080px;
  width: 60%;
  min-width: 800px;
  margin: 40px auto 80px;
  padding: 40px;
  background-color: #ccc;
`;
const Header = styled.div`
  flex: 1 1 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  p:first-child {
    font-size: 1.4rem;
    font-weight: bold;
  }

  div:first-child {
    p:first-child {
      font-size: 1.75rem;
    }

    p:last-child {
      font-size: 1.25rem;
      cursor: pointer;
    }
  }
`;
const ContentSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 40px;
  width: 100%;
`;
const SortOptions = styled.div`
  flex: 100%;
  margin-bottom: 20px;
  border-bottom: 3px solid #fff;

  ul {
    display: flex;
    gap: 25px;

    li {
      padding: 0 4px 9px;
      cursor: pointer;
    }
  }

  .selected-sort {
    margin-bottom: -3px;
    border-bottom: 3px solid cyan;
  }
`;
const PostsContainer = styled.div`
  flex: 1 1 45%;
`;

function SubPage({ loggedIn, signInOut, currentUser, userList, subList, followSub, unfollowSub, favoritePost, unfavoritePost, adjustPostVotes, storage }) {
  const params = useParams();

  const [sub, setSub] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingSubInfo, setLoadingSubInfo] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  const sortPosts = (e) => {
    const postsCopy = [...posts];

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
      const path = `${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`;

      return (
        <Link to={path} key={post.uid} className='default-link'>
          <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={post} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />
        </Link>
      )
    });
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <Wrapper>
        <Header>
          {
            loadingSubInfo ?
            <p>Loading...</p> :
            <>
              <div>
                <p>{sub.subTitle}</p>
                <p>r/{sub.name}</p>
              </div>
              {
              loggedIn &&
              <div>
                {
                  currentUser.followedSubs.includes(sub.name) ?
                  <button onClick={() => unfollowSub(sub.name)}>Unfollow</button> :
                  <button onClick={() => followSub(sub.name)}>Follow</button>
                }
              </div>
              }
            </>
          }
        </Header>

        <ContentSection>
          <SortOptions>
            <ul>
              <li onClick={(e) => sortPosts(e)} className='selected-sort'>Top</li>
              <li onClick={(e) => sortPosts(e)}>New</li>
            </ul>
          </SortOptions>

          <PostsContainer>
            {
              loadingPosts ?
              <p>Loading...</p> :
              getPostPreview()
            }
          </PostsContainer>
          {
           loadingSubInfo ?
            <p>Loading...</p> :  
            <AboutSection loggedIn={loggedIn} currentUser={currentUser} userList={userList} sub={sub} /> 
          }
        </ContentSection>
      </Wrapper>
    </div>
  );
};

export default SubPage;