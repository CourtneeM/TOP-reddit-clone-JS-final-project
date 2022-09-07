import { Link } from 'react-router-dom';
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin-right: 80px;
  margin-bottom: 20px;
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

function PostPreview({ loggedIn, currentUser, post, adjustPostVotes }) {
  const adjustPostVotesHandler = (e) => {
    const currentUserCopy = {...currentUser};
    
    const initialSetup = (type) => {
      if (!currentUserCopy.votes[type].posts[post.subName]) {
        currentUserCopy.votes[type].posts[post.subName] = [];
      }
    }
    const removeEmptySubOrPost = (type) => {
      if (currentUserCopy.votes[type].posts[post.subName].length === 0) {
        delete currentUserCopy.votes[type].posts[post.subName];
      }
    }

    const upvoteHandler = () => {
      const removeUpvote = () => {
        const userUidIndex = post.upvotes.indexOf(currentUser.uid);
        post.upvotes.splice(userUidIndex, 1);

        const postUidIndex = currentUserCopy.votes.upvotes.posts[post.subName].indexOf(post.uid); 
        currentUserCopy.votes.upvotes.posts[post.subName].splice(postUidIndex, 1);

        removeEmptySubOrPost('upvotes');

        adjustPostVotes(-1, post, currentUserCopy);
      }
      const removeDownvote = () => {
        const userUidIndex = post.downvotes.indexOf(currentUser.uid);
        post.downvotes.splice(userUidIndex, 1);

        const postUidIndex = currentUserCopy.votes.downvotes.posts[post.subName].indexOf(post.uid);
        currentUserCopy.votes.downvotes.posts[post.subName].splice(postUidIndex, 1);

        removeEmptySubOrPost('downvotes');
        
        adjustPostVotes(1, post, currentUserCopy);
      }
      
      initialSetup('upvotes');

      if (post.upvotes.includes(currentUser.uid)) return removeUpvote();
      if (post.downvotes.includes(currentUser.uid)) removeDownvote();
      
      post.upvotes.push(currentUser.uid);
      currentUserCopy.votes.upvotes.posts[post.subName].push(post.uid);

      adjustPostVotes(1, post, currentUserCopy);
    }
    const downvoteHandler = () => {
      const removeDownvote = () => {
        const userUidIndex = post.downvotes.indexOf(currentUser.uid);
        post.downvotes.splice(userUidIndex, 1);

        const postUidIndex = currentUserCopy.votes.downvotes.posts[post.subName].indexOf(post.uid);
        currentUserCopy.votes.downvotes.posts[post.subName].splice(postUidIndex, 1);

        removeEmptySubOrPost('downvotes');

        adjustPostVotes(1, post, currentUserCopy);
      }
      const removeUpvote = () => {
        const userUidIndex = post.upvotes.indexOf(currentUser.uid);
        post.upvotes.splice(userUidIndex, 1);
        
        const postUidIndex = currentUserCopy.votes.upvotes.posts[post.subName].indexOf(post.uid);
        currentUserCopy.votes.upvotes.posts[post.subName].splice(postUidIndex);

        removeEmptySubOrPost('upvotes');
        
        adjustPostVotes(-1, post, currentUserCopy);
      }

      initialSetup('downvotes');

      if (post.downvotes.includes(currentUser.uid)) return removeDownvote();
      if (post.upvotes.includes(currentUser.uid)) removeUpvote();

      post.downvotes.push(currentUser.uid);
      currentUserCopy.votes.downvotes.posts[post.subName].push(post.uid);

      adjustPostVotes(-1, post, currentUserCopy);
    }

    e.target.className === "upvote-icon" ? upvoteHandler() : downvoteHandler();
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