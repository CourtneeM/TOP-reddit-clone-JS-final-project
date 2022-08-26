import { Link } from 'react-router-dom';
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin: 0 80px 20px 0;
  padding: 20px 60px;
  background-color: #bbb;
`;
const Header = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;

  p:first-child span {
    cursor: pointer;
  }

  p:last-child {
    font-style: italic;
    color: #555;
  }
`;
const Body = styled.div`
  margin-bottom: 15px;

  h4 {
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
`;
const Options = styled.div`
  display: flex;
  gap: 40px;

  p {
    cursor: pointer;
  }

  p:nth-child(2) {
    margin-left: auto;
  }
`;
const VoteStatus = styled.div`
  position: absolute;
  top: 20px;
  left: 25px;

  p:nth-child(2n+1) {
    cursor: pointer;
  }
`;

function PostPreview({ post }) {
  return (
    <Wrapper>
      {/* <Link to={`/post/${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`} > */}
        <Header>
          <p>Posted by <span>u/{post.owner}</span></p>
          <p>{`${post.creationDateTime.date.month}/${post.creationDateTime.date.day}/${post.creationDateTime.date.year}`}</p>
        </Header>
        <Body>
          <h4>{post.title}</h4>
          <p>{post.content}</p>
        </Body>
      {/* </Link> */}
      <Options>
        <p>{Object.values(post.comments)[0] || 0} comments</p>
        <p>Favorite</p>
        <p>Share</p>
      </Options>
      <VoteStatus>
        <p>^</p>
        <p>{post.votes}</p>
        <p>v</p>
      </VoteStatus>
    </Wrapper>
  );
};

export default PostPreview;