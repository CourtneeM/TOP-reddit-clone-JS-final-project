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

function PostPreview({ loggedIn, currentUser, post, favoritePost, unfavoritePost, adjustPostVotes }) {
  const adjustPostVotesHandler = (e) => {
    adjustPostVotes(e.target.className === "upvote-icon" ? 1 : -1, post.uid, post.subName);
  }

  const getNumComments = () => Object.keys(post.comments).length;

  return (
    <Wrapper>
      <Header>
        <p>r/{post.subName}</p>
        <p>Posted by
          <Link to={`/u/${post.owner.uid}/${post.owner.name}`}>
            u/{post.owner.name}
          </Link>
          </p>
        <p>{`${post.creationDateTime.date.month}/${post.creationDateTime.date.day}/${post.creationDateTime.date.year}`}</p>
      </Header>
      <Body>
        <h4>{post.title}</h4>
        <p>{post.content}</p>
      </Body>
      <Options>
        <p>{getNumComments() === 1 ? getNumComments() + ' comment' : getNumComments() + ' comments'}</p>
        { loggedIn ?
          currentUser.favorite.posts[post.subName] && currentUser.favorite.posts[post.subName].includes(post.uid) ?
          <p onClick={() => unfavoritePost(post.subName, post.uid)}>Unfavorite</p> :
          <p onClick={() => favoritePost(post.subName, post.uid)}>Favorite</p> :
          null
        }
        <p>Share</p>
      </Options>
      <VoteStatus>
        { loggedIn && <p className="upvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>^</p> }
        <p>{post.votes}</p>
        { loggedIn && <p className="downvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>v</p> }
      </VoteStatus>
    </Wrapper>
  );
};

export default PostPreview;