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

function Home({ subList }) {
  const topPosts = [].concat.apply([], Object.keys(subList).map((key) => subList[key].getTopPosts()));

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
            {
              topPosts.map((post) => <PostPreview post={Object.values(post)[0]} />)
            }
          </PostsContainer>
        </PostsSection>

        {/* <AboutSection /> */}
      </Wrapper>
    </div>
  );
}

export default Home;