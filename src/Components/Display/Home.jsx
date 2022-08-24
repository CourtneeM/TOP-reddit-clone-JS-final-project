import Navbar from "./Navbar";
import PostPreview from "./PostPreview";

import styled from "styled-components";
import AboutSection from "./AboutSection";

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

function Home() {
  return (
    <div>
      <Navbar />
      <Wrapper>
        <PostsSection>
          <SortOptions>
            <ul>
              <li>Hot</li>
              <li>New</li>
              <li>Top</li>
            </ul>
          </SortOptions>

          <PostsContainer>
            <PostPreview />
          </PostsContainer>
        </PostsSection>

        <AboutSection />
      </Wrapper>
    </div>
  );
}

export default Home;