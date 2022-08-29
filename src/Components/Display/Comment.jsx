import { useEffect, useState } from "react";
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

function Comment({ loggedIn, comment }) {
  const [currentComment, setCurrentComment] = useState(null);
  
  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  const adjustVotes = (e) => {
    e.target.className === 'upvote-icon' ? comment.adjustVotes(1) : comment.adjustVotes(-1);
  }

  return (
    <Wrapper>
      <CommentHeader>
        {/* <img src="" alt="user" /> */}
        <p>u/{comment.owner}</p>
        <p>{comment.creationDateTime.date.month}/{comment.creationDateTime.date.day}/{comment.creationDateTime.date.year}</p>
      </CommentHeader>

      <CommentText>{comment.text}</CommentText>

      <CommentActions>
        <div>
          { loggedIn && <p className="upvote-icon" onClick={(e) => adjustVotes(e)}>^</p> }
          <p>{comment.votes}</p>
          { loggedIn && <p className="downvote-icon" onClick={(e) => adjustVotes(e)}>v</p> }
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