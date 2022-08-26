import { Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";
import Navbar from "./Navbar";

import styled from "styled-components";


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


function Sub({ sub }) {
  console.log(sub);

  return (
    <div>
      <Navbar />

      <Wrapper>
        <Header>
          <div>
            {/* <img src="" alt="sub pic" /> */}
            <p>{sub.subTitle}</p>
            <p>r/{sub.name}</p>
          </div>
          <div>
            <button>Follow</button>
          </div>
        </Header>

        <PostsSection>
          <SortOptions>
            <ul>
              <li>Hot</li>
              <li>New</li>
              <li>Top</li>
            </ul>
          </SortOptions>

          <PostsContainer>
              {
                Object.values(sub.posts).map((post) => {
                  return (
                    <Link to={`/r/${sub.name.split(' ').join('_').toLowerCase()}/${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`}>
                      <PostPreview post={post} />
                    </Link>
                  )
                })
              }
          </PostsContainer>
        </PostsSection>

        <AboutSection sub={sub} />
      </Wrapper>
    </div>
  );
};

export default Sub;