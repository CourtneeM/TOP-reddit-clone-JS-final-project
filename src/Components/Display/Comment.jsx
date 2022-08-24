import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 20px;
  padding: 5px 30px;
  background-color: #ccc;
`;
const CommentHeader = styled.div`
  display: flex;
  gap: 20px;
  padding: 15px 0;

  p:first-child {
    cursor: pointer;
  }
  
  p:nth-child(2) {
    font-style: italic;
    color: #555;
  }
`;
const CommentText = styled.p`
  padding: 20px 0;
`;
const CommentActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 0;

  div {
    display: flex;
    gap: 20px;

    p { cursor: pointer; }
    
    &:first-child {
      p:nth-child(2) { cursor: default; }
    }
  }
`;

function Comment({ username, creationDateTime, commentText }) {
  return (
    <Wrapper>
      <CommentHeader>
        {/* <img src="" alt="user" /> */}
        <p>{username} username</p>
        <p>{creationDateTime} creation date time</p>
      </CommentHeader>

      <CommentText>{commentText} Comment text</CommentText>

      <CommentActions>
        <div>
          <p className="upvote-icon">^</p>
          <p>numVotes</p>
          <p className="downvote-icon">v</p>
          <p>Reply</p>
        </div>
        <div>
          <p>Favorite</p>
          <p>Share</p>
        </div>
      </CommentActions>
    </Wrapper>
  );
};

export default Comment;