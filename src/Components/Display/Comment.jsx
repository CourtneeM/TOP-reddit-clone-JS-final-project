import { useState } from "react";
import { Link } from "react-router-dom";

import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 20px;
  padding: 5px 30px;
  background-color: #ccc;

  .hidden {
    display: none;
  }
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
const CommentReply = styled.div`
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid #888;

  textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
  }

  div {
    display: flex;
    justify-content: flex-end;
    gap: 40px;

    p {
      cursor: pointer;
    }
  }
`;
const Replies = styled.div`
  border-left: 1px solid #888;
`;

function Comment({ loggedIn, currentUser, subList, comments, comment, commentReply, favoriteComment, unfavoriteComment, deleteComment, adjustCommentVotes }) {
  const [replyText, setReplyText] = useState('');

  const deleteCommentHandler = () => {
    // display popup confirmation
    if ((comment.owner.uid === currentUser.uid) || (loggedIn && subList[comment.subName].moderators.includes(currentUser.uid))) {
      deleteComment(comment);
    }
  }

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

  const displayReplyContainer = () => {
    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.remove('hidden');
  }

  const commentReplyHandler = (e) => {
    e.preventDefault();

    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.add('hidden');

    commentReply(replyText, comment);
    setReplyText('');
  }
  
  const cancelReply = (e) => {
    e.preventDefault();

    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.add('hidden');
    setReplyText('');
  }

  return (
    <Wrapper id={comment.uid}>
      <CommentHeader>
        {/* <img src="" alt="user" /> */}
        <Link to={`/u/${comment.owner.uid}/${comment.owner.uid}`}>
          <p>u/{comment.owner.name}</p>
        </Link>
        <p>{comment.creationDateTime.date.month}/{comment.creationDateTime.date.day}/{comment.creationDateTime.date.year}</p>
      </CommentHeader>

      <CommentText>{comment.text}</CommentText>

      <CommentActions>
        <div>
          { loggedIn && <p className="upvote-icon" onClick={(e) => adjustVotesHandler(e)}>^</p> }
          <p>{comment.votes}</p>
          { loggedIn && <p className="downvote-icon" onClick={(e) => adjustVotesHandler(e)}>v</p> }
          <p onClick={displayReplyContainer}>Reply</p>
        </div>
        <div>
          {
            loggedIn ?
            currentUser.favorite.comments[comment.subName] &&
            currentUser.favorite.comments[comment.subName][comment.postUid] &&
            currentUser.favorite.comments[comment.subName][comment.postUid].includes(comment.uid) ?
            <p onClick={() => unfavoriteComment(comment.subName, comment.postUid, comment.uid)}>Unfavorite</p> :
            <p onClick={() => favoriteComment(comment.subName, comment.postUid, comment.uid)}>Favorite</p> :
            null
          }
          <p>Share</p>
          { (loggedIn && comment.owner.uid === currentUser.uid) ||
            (loggedIn && subList[comment.subName].moderators.includes(currentUser.uid)) ?
            <p onClick={deleteCommentHandler}>Delete</p> :
            null
          }
        </div>
      </CommentActions>
      <CommentReply className={`comment-reply-container-${comment.uid} hidden`}>
        <textarea name="comment-reply" id="comment-reply" cols="30" rows="10"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        >
        </textarea>
        <div>
          <button onClick={(e) => cancelReply(e)}>Cancel</button>
          <button onClick={(e) => commentReplyHandler(e)}>Reply</button>
        </div>
      </CommentReply>
      <Replies>
        { 
          Object.values(comment.children).length > 0 ?
          Object.values(comments).map((nextComment) => {
            return comment.children.map((child) => {
              return nextComment.uid === child ?
              <Comment
              key={Object.values(nextComment).uid}
              loggedIn={loggedIn}
              currentUser={currentUser}
              comments={comments}
              comment={nextComment}
              commentReply={commentReply}
              favoriteComment={favoriteComment}
              unfavoriteComment={unfavoriteComment}
              deleteComment={deleteComment}
              adjustCommentVotes={adjustCommentVotes}
              /> :
              null
            })
          }) :
          null
        }
      </Replies>
    </Wrapper>
  );
};

export default Comment;