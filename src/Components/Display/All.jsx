import { useParams, Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";
import Navbar from "./Navbar";

import styled from "styled-components";
import { useEffect, useState } from 'react';


const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 60%;
  min-width: 800px;
  margin: 0 auto 80px;
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

function All({ loggedIn, subList }) {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    setPosts([].concat.apply([], Object.values(subList).map((sub) => Object.values(sub.posts))));
  }, []);

  const sortPosts = (e) => {
    const postsCopy = [...posts];
    console.log(postsCopy);

    if (e.target.textContent === 'Top') {
      postsCopy.sort((a, b) => b.votes - a.votes);
    }
    
    if (e.target.textContent === 'New') {
      postsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
    }

    setPosts(postsCopy);
  }

  const getPostPreview = () => {
    return Object.values(posts).map((post) => {
      return (
        <Link to={`/r/${post.subName.split(' ').join('_').toLowerCase()}/${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`}>
          <PostPreview key={post.uid} post={post} />
        </Link>
      )
    });
  }

  return (
    <div>
      <Navbar />
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
};

export default All;