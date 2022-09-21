import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";
import Navbar from "./Navbar";

import uniqid from 'uniqid';
import styled from "styled-components";


const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
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
  margin-bottom: 60px;

  p:first-child {
    font-size: 1.4rem;
    font-weight: bold;
  }

  p:last-child {
    cursor: pointer;
  }
`;
const PostsSection = styled.div`
  flex: 75%
`;
const SortOptions = styled.div`
  margin: 0 80px 20px 0;
  padding: 10px 20px;

  background-color: #aaa;

  ul {
    display: flex;
    gap: 40px;

    li {
      cursor: pointer;
    }
  }
`;
const PostsContainer = styled.div`

`;

function All({ loggedIn, signInOut, currentUser, subList, favoritePost, unfavoritePost, adjustPostVotes, storage}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPosts([].concat.apply([], Object.values(subList).map((sub) => Object.values(sub.posts))));
  }, [subList]);
  useEffect(() => {
    setLoading(false);
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
    const existingPosts = posts.filter((post) => !post.deleteStatus.deleted);
    return existingPosts.map((post) => {
      const path = `/r/${post.subName}/${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`
      return (
        <Link to={path} key={post.uid}>
          <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={post} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />
        </Link>
      );
    });
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />
      <Wrapper>
        <PostsSection>
          <SortOptions>
            <ul>
              <li onClick={(e) => sortPosts(e)}>Top</li>
              <li onClick={(e) => sortPosts(e)}>New</li>
            </ul>
          </SortOptions>

          <PostsContainer>
            {
              loading ?
              <p>Loading...</p> :
              getPostPreview()
            }
          </PostsContainer>
        </PostsSection>

        {/* <AboutSection /> */}
      </Wrapper>
    </div>
  );
};

export default All;