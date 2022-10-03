import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 60%;
  min-width: 800px;
  margin: 40px auto 80px;
  padding: 40px 180px;
  background-color: #ccc;
  border-radius: 8px;
`;
const PostsSection = styled.div`
  flex: 75%
`;
const SortOptions = styled.div`
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
    if (document.querySelector('.selected-sort')) document.querySelector('.selected-sort').classList.remove('selected-sort');
    e.target.classList.add('selected-sort');

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
        <Link to={path} key={post.uid} className='default-link'>
          <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={post} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} storage={storage} />
        </Link>
      );
    });
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} currentSub={'All'} />
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