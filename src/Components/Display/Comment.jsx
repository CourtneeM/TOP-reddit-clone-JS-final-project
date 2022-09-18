import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
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
  align-items: center;
  gap: 20px;
  padding: 15px 0;

  p:first-child {
    cursor: pointer;
  }
  
  p:nth-child(2) {
    font-style: italic;
    color: #555;
  }

  .user-name-image {
    display: flex;
    align-items: center;

    img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
      border-radius: 50%;
    }
  }
`;
const CommentText = styled.div`
  padding: 20px 0;

  textarea {
    width: 100%;
  }
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
  }

  p { color: red; }
`;
const Replies = styled.div`
  border-left: 1px solid #888;
`;

function Comment({ loggedIn, currentUser, userList, subList, comments, comment, commentReply, favoriteComment, unfavoriteComment, editComment, deleteComment, adjustCommentVotes, storage }) {
  const [replyText, setReplyText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [profileImg, setProfileImg] = useState('');

  useEffect(() => {
    setCommentText(comment.text);
  }, [comment]);
  useEffect(() => {
    const imageRef = ref(storage, userList[comment.owner.uid].profileImage);
    getDownloadURL(imageRef)
      .then((url) => {
        setProfileImg(url);
      })
      .catch((err) => console.log('error setting profile image', err));
  }, [storage]);

  const displayCommentActions = () => {
    const displayVoteButton = (type, symbol) => {
      return loggedIn && <p className={`${type}-icon`} onClick={(e) => adjustVotesHandler(e)}>{symbol}</p>
    };
    const displayFavoriteButtons = () => {
      return (
        loggedIn ?
        currentUser.favorite.comments[comment.subName] &&
        currentUser.favorite.comments[comment.subName][comment.postUid] &&
        currentUser.favorite.comments[comment.subName][comment.postUid].includes(comment.uid) ?
        <p onClick={() => unfavoriteComment(comment.subName, comment.postUid, comment.uid)}>Unfavorite</p> :
        <p onClick={() => favoriteComment(comment.subName, comment.postUid, comment.uid)}>Favorite</p> :
        null
      );
    };
    const displayEditButton = () => {
      return (
        (loggedIn && comment.owner.uid === currentUser.uid) &&
        <p onClick={() => setEditMode(true)}>Edit</p>
      );
    };
    const displayDeleteButton = () => {
      return (
        (loggedIn && comment.owner.uid === currentUser.uid) ||
        (loggedIn && subList[comment.subName].moderators.includes(currentUser.uid)) ?
        <p onClick={deleteCommentHandler}>Delete</p> :
        null
      );
    };
    const shareCommentHandler = () => {
      const initialUrl = window.location.href.slice(0, window.location.href.lastIndexOf('/r/'));
      navigator.clipboard.writeText(`${initialUrl}/r/${comment.subName}/${comment.postUid}/${subList[comment.subName].posts[comment.postUid].title.split(' ').join('_').toLowerCase()}/#${comment.uid}`);
  
      const shareBtn = document.getElementById(comment.uid).querySelector('.share-btn');
      shareBtn.textContent = 'Link copied';
      setTimeout(() => shareBtn.textContent = 'Share', 5000);
    }

    return (
      <>
        <div>
          { displayVoteButton('upvote', '^') }
          <p>{comment.votes}</p>
          { displayVoteButton('downvote', 'v') }

          <p onClick={displayReplyContainer}>Reply</p>
        </div>
        <div>
          { displayFavoriteButtons() }
          <p className='share-btn' onClick={shareCommentHandler}>Share</p>
          { displayEditButton() }
          { displayDeleteButton() }
        </div>
      </>
    );
  }
  const displayEditActions = () => {
    return (
      <>
        <button onClick={cancelEditCommentHandler}>Cancel</button>
        <button onClick={editCommentHandler}>Edit</button>
      </>
    )
  }
  const displayReplyContainer = () => {
    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.remove('hidden');
  }

  const editCommentHandler = () => {
    setEditMode(false);

    const editedComment = {...comment};
    editedComment.text = commentText;
    if (comment.owner.uid === currentUser.uid) editComment(editedComment);
  }
  const cancelEditCommentHandler = () => {
    setEditMode(false);
    setCommentText(comment.text);
  }
  const deleteCommentHandler = () => {
    // display popup confirmation
    if ((comment.owner.uid === currentUser.uid) || (loggedIn && subList[comment.subName].moderators.includes(currentUser.uid))) {
      deleteComment(comment);
    }
  }
  const commentReplyHandler = (e) => {
    e.preventDefault();

    if (replyText === '') return displayInputError();

    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.add('hidden');

    commentReply(replyText, comment);
    setReplyText('');
  }
  const displayInputError = () => {
    const errorMsg = document.querySelector(`.comment-error-msg-${comment.uid}`);

    errorMsg.textContent = 'Error: Comment cannot be empty';

    setTimeout(() => {
      errorMsg.classList.add('hidden');
    }, 5000);
    errorMsg.classList.remove('hidden');
  }
  const cancelReply = (e) => {
    e.preventDefault();

    document.querySelector(`.comment-reply-container-${comment.uid}`).classList.add('hidden');
    setReplyText('');
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

  return (
    <Wrapper id={comment.uid}>
      <CommentHeader>
        <Link to={`/u/${comment.owner.uid}/${comment.owner.uid}`}>
          <div className='user-name-image'>
            <img src={profileImg} alt="" />
            <p>u/{comment.owner.name}</p>
          </div>
        </Link>
        <p>{comment.creationDateTime.date.month}/{comment.creationDateTime.date.day}/{comment.creationDateTime.date.year}</p>
        { comment.editStatus.edited ?
          <p>Edited: {comment.editStatus.editDateTime.date.month}/{comment.editStatus.editDateTime.date.day}/{comment.editStatus.editDateTime.date.year}</p> :
          null
        }
      </CommentHeader>

      <CommentText>
        { editMode ?
          <textarea name="comment-text" id="comment-text" cols="30" rows="10" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea> :
          <p>{comment.text}</p>
        }
      </CommentText>

      <CommentActions>
        { editMode ?
          displayEditActions() :
          displayCommentActions()
        }
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
        <p className={`comment-error-msg-${comment.uid} hidden`}></p>
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
              userList={userList}
              subList={subList}
              comments={comments}
              comment={nextComment}
              commentReply={commentReply}
              favoriteComment={favoriteComment}
              unfavoriteComment={unfavoriteComment}
              deleteComment={deleteComment}
              adjustCommentVotes={adjustCommentVotes}
              storage={storage}
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