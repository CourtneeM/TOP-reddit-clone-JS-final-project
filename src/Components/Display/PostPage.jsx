import Comment from './Comment';
import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  display: flex;
  gap: 40px;
  padding: 20px 0;

  p:nth-child(-n+2) {
    cursor: pointer;
  }
`;
const Body = styled.div`
  padding: 40px 40px 100px;
  background-color: #ccc;

  h2 {
    margin-bottom: 40px;
    font-size: 2.8rem;
  }

  p {
    margin-bottom: 20px;
  }
`;
const CommentSection = styled.div`
  padding: 20px 0;
`;
const CompositionContainer = styled.div`
  margin: 60px auto 80px;
  padding: 0 40px;

  p {
    margin-bottom: 10px;
  }

  textarea {
    width: 100%;
  }

`;
const CommentsContainer = styled.div`
  padding: 0 40px;

  > p {
    margin-bottom: 20px;
    font-size: 0.9rem;
  }
`;

function PostPage() {
  return (
    <Wrapper>
      <Header>
        <p>SubName</p>
        <p>Posted by u/userName</p>
        <p>DateTime</p>
      </Header>
      <Body>
        <div>
          <h2>Title</h2>
          <p>Post Text / Media</p>
        </div>
      </Body>
      <CommentSection>
        <CompositionContainer>
          <p>Comment as u/username</p>
          <form action="#">
            <textarea name="comment-text" id="comment-text" cols="30" rows="10"></textarea>
            <button>Submit</button>
          </form>
        </CompositionContainer>
        <CommentsContainer>
          <p>Sort Options: Highest Rating | Lowest Rating | Oldest | Newest</p>
          <Comment />
          <Comment />
          <Comment />
          <Comment />
        </CommentsContainer>
      </CommentSection>
    </Wrapper>
  );
};

export default PostPage;