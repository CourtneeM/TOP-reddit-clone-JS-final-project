import { Link } from 'react-router-dom';
import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 20px;  padding: 5px 30px;
  background-color: #eee;
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

function CommentPreview({ loggedIn, currentUser, postTitle, comments, comment, adjustCommentVotes }) {
  const adjustVotesHandler = (e) => {
    const currentUserCopy = {...currentUser};

    const removeEmptySubOrPost = (type) => {
      if (type === 'downvotes' && currentUserCopy.votes[type].comments[comment.subName][comment.postUid].length === 0) {
        delete currentUserCopy.votes[type].comments[comment.subName][comment.postUid];
      }

      if (Object.values(currentUserCopy.votes[type].comments[comment.subName]).length === 0) {
        delete currentUserCopy.votes[type].comments[comment.subName];
      }
    }
    const upvoteHandler = () => {
      const initialSetup = () => {
        if (!currentUserCopy.votes.upvotes.comments[comment.subName]) {
          currentUserCopy.votes.upvotes.comments = { [comment.subName]: { }};
        }
        
        if (!currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid]) {
          currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid] = '';
        }
      }
      
      const checkForExistingUpvote = () => {
        Object.values(comments).forEach((commentEl) => {
          if (commentEl.uid === comment.uid) return;

          if (commentEl.upvotes.includes(currentUser.uid)) {
            const index = commentEl.upvotes.indexOf(currentUser.uid);
            commentEl.upvotes.splice(index, 1);
            adjustCommentVotes(-1, commentEl, currentUserCopy);
          }
        });
      }
      const removeUpvote = () => {
        const userUidIndex = comment.upvotes.indexOf(currentUser.uid);
        comment.upvotes.splice(userUidIndex, 1);

        delete currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid];

        removeEmptySubOrPost('upvotes');

        adjustCommentVotes(-1, comment, currentUserCopy);
      }
      const removeDownvote = () => {
        const userUidIndex = comment.downvotes.indexOf(currentUser.uid);
        comment.downvotes.splice(userUidIndex, 1);

        const commentUidIndex = currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].indexOf(comment.uid);
        currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].splice(commentUidIndex, 1);

        removeEmptySubOrPost('downvotes');
        
        adjustCommentVotes(1, comment, currentUserCopy);
      }
      
      initialSetup();
      checkForExistingUpvote();

      if (comment.upvotes.includes(currentUser.uid)) return removeUpvote();
      if (comment.downvotes.includes(currentUser.uid)) removeDownvote();
      
      comment.upvotes.push(currentUser.uid);
      currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid] = comment.uid;

      adjustCommentVotes(1, comment, currentUserCopy);
    }
    const downvoteHandler = () => {
      const initialSetup = () => {
        if (!currentUserCopy.votes.downvotes.comments[comment.subName]) {
          currentUserCopy.votes.downvotes.comments = { [comment.subName]: { }};  
        }
        
        if (!currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid]) {
          currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid] = [];
        }
      }
      const removeDownvote = () => {
        const userUidIndex = comment.downvotes.indexOf(currentUser.uid);
        comment.downvotes.splice(userUidIndex, 1);

        const commentUidIndex = currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].indexOf(comment.uid);
        currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].splice(commentUidIndex, 1);

        removeEmptySubOrPost('downvotes');

        adjustCommentVotes(1, comment, currentUserCopy);
      }
      const removeUpvote = () => {
        const userUidIndex = comment.upvotes.indexOf(currentUser.uid);
        comment.upvotes.splice(userUidIndex, 1);
        
        delete currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid];

        removeEmptySubOrPost('upvotes');
        
        adjustCommentVotes(-1, comment, currentUserCopy);
      }

      initialSetup();
      if (comment.downvotes.includes(currentUser.uid)) return removeDownvote();
      if (comment.upvotes.includes(currentUser.uid)) removeUpvote();

      comment.downvotes.push(currentUser.uid);
      currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].push(comment.uid);

      adjustCommentVotes(-1, comment, currentUserCopy);
    }

    e.target.className === 'upvote-icon' ? upvoteHandler() : downvoteHandler();
  }
  const shareCommentHandler = () => {
    const initialUrl = window.location.href.slice(0, window.location.href.lastIndexOf('/u/'));
    navigator.clipboard.writeText(`${initialUrl}/r/${comment.subName}/${comment.postUid}/${postTitle.split(' ').join('_').toLowerCase()}/#${comment.uid}`);

    const shareBtn = document.getElementById(comment.uid).querySelector('.share-btn');
    shareBtn.textContent = 'Link copied';
    setTimeout(() => shareBtn.textContent = 'Share', 5000);
  }
  
  return (
    <Wrapper id={comment.uid}>
      <CommentHeader>
        {/* <img src="" alt="user" /> */}
        <p>
          <Link to={`/u/${comment.owner.uid}/${comment.owner.name}`}>
            u/{comment.owner.name}
          </Link>
        </p>
        <p>{comment.creationDateTime.date.month}/{comment.creationDateTime.date.day}/{comment.creationDateTime.date.year}</p>
      </CommentHeader>

      <CommentText>{comment.text}</CommentText>

      <CommentActions>
        <div>
          { loggedIn && <p className="upvote-icon" onClick={(e) => adjustVotesHandler(e)}>^</p> }
          <p>{comment.votes}</p>
          { loggedIn && <p className="downvote-icon" onClick={(e) => adjustVotesHandler(e)}>v</p> }
        </div>
        <div>
          <p className='share-btn' onClick={shareCommentHandler}>Share</p>
        </div>
      </CommentActions>
    </Wrapper>
  );
};

export default CommentPreview;