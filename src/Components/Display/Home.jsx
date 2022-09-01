import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import Navbar from "./Navbar";
import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";

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

function Home({ loggedIn, currentUser, subList, topPosts, favoritePost, unfavoritePost, adjustPostVotes }) {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    if (Object.values(topPosts).length !== 0) {
      setPosts(topPosts);
      console.log('Set Posts');
    }
  }, [topPosts]);

  const sortPosts = (e) => {
    const postsCopy = [...posts];

    if (e.target.textContent === 'Top') {
      postsCopy.sort((a, b) => Object.values(b)[0].votes - Object.values(a)[0].votes);
    }
    
    if (e.target.textContent === 'New') {
      postsCopy.sort((a, b) => Object.values(b)[0].creationDateTime.fullDateTime - Object.values(a)[0].creationDateTime.fullDateTime);
    }

    setPosts(postsCopy);
  }

  const getPostPreview = () => {
    return Object.values(posts).map((post) => {
      const postDetails = Object.values(post)[0];
      const path = `/r/${postDetails.subName}/${postDetails.uid}/${postDetails.title.split(' ').join('_').toLowerCase()}`;

      return (
        <Link to={path} key={postDetails.uid}>
          <PostPreview key={postDetails.uid} loggedIn={loggedIn} currentUser={currentUser} post={postDetails} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} />
        </Link>
      )
    });
  }

  return (
    <div>
      <Navbar subList={subList} />
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
              posts.length ?
              getPostPreview() :
              <p>Loading...</p>
            }
          </PostsContainer>
        </PostsSection>

        {/* <AboutSection /> */}
      </Wrapper>
    </div>
  );
}

export default Home;