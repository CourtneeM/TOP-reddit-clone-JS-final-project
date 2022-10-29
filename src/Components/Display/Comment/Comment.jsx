import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";

import { LogInOutContext } from "../../Contexts/LogInOutContext";
import { UserContext } from "../../Contexts/UserContext";
import { SubContext } from "../../Contexts/SubContext";

import styles from './Comment.module.css';

function Comment({ comments, comment, commentReply, commentActions, storage }) {
  const [replyText, setReplyText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [profileImg, setProfileImg] = useState('');

  const { loggedIn } = useContext(LogInOutContext);
  const { userList, currentUser } = useContext(UserContext);
  const { subList } = useContext(SubContext);

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

  const actions = (() => {
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
              commentActions.adjustCommentVotes(-1, commentEl, currentUserCopy);
            }
          });
        }
        const removeUpvote = () => {
          const userUidIndex = comment.upvotes.indexOf(currentUser.uid);
          comment.upvotes.splice(userUidIndex, 1);

          delete currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid];

          removeEmptySubOrPost('upvotes');

          commentActions.adjustCommentVotes(-1, comment, currentUserCopy);
        }
        const removeDownvote = () => {
          const userUidIndex = comment.downvotes.indexOf(currentUser.uid);
          comment.downvotes.splice(userUidIndex, 1);

          const commentUidIndex = currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].indexOf(comment.uid);
          currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].splice(commentUidIndex, 1);

          removeEmptySubOrPost('downvotes');
          
          commentActions.adjustCommentVotes(1, comment, currentUserCopy);
        }
        
        initialSetup();
        checkForExistingUpvote();

        if (comment.upvotes.includes(currentUser.uid)) return removeUpvote();
        if (comment.downvotes.includes(currentUser.uid)) removeDownvote();
        
        comment.upvotes.push(currentUser.uid);
        currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid] = comment.uid;

        commentActions.adjustCommentVotes(1, comment, currentUserCopy);
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

          commentActions.adjustCommentVotes(1, comment, currentUserCopy);
        }
        const removeUpvote = () => {
          const userUidIndex = comment.upvotes.indexOf(currentUser.uid);
          comment.upvotes.splice(userUidIndex, 1);
          
          delete currentUserCopy.votes.upvotes.comments[comment.subName][comment.postUid];

          removeEmptySubOrPost('upvotes');
          
          commentActions.adjustCommentVotes(-1, comment, currentUserCopy);
        }

        initialSetup();
        if (comment.downvotes.includes(currentUser.uid)) return removeDownvote();
        if (comment.upvotes.includes(currentUser.uid)) removeUpvote();

        comment.downvotes.push(currentUser.uid);
        currentUserCopy.votes.downvotes.comments[comment.subName][comment.postUid].push(comment.uid);

        commentActions.adjustCommentVotes(-1, comment, currentUserCopy);
      }

      e.target.className === 'upvote-icon' ? upvoteHandler() : downvoteHandler();
    }
    const editCommentHandler = () => {
      if (commentText === '') return display.inputError();

      setEditMode(false);

      const editedComment = {...comment};
      editedComment.text = commentText;
      if (comment.owner.uid === currentUser.uid) commentActions.editComment(editedComment);
    }
    const cancelEditCommentHandler = () => {
      setEditMode(false);
      setCommentText(comment.text);
    }
    const deleteCommentHandler = () => {
      // display popup confirmation
      if ((comment.owner.uid === currentUser.uid) || (loggedIn && subList[comment.subName].moderators.includes(currentUser.uid))) {
        commentActions.deleteComment(comment);
      }
    }
    const commentReplyHandler = (e) => {
      e.preventDefault();

      if (replyText === '') return display.inputError();

      display.hideReplyContainer();

      commentReply(replyText, comment);
      setReplyText('');
    }
    const cancelReply = (e) => {
      e.preventDefault();

      display.hideReplyContainer();
      setReplyText('');
    }

    return { adjustVotesHandler, editCommentHandler, cancelEditCommentHandler, deleteCommentHandler, commentReplyHandler, cancelReply }
  })();
  const display = (() => {
    const header = () => {
      return (
        <>
          <Link to={`/u/${comment.owner.uid}/${comment.owner.uid}`} className='default-link'>
            <div className={styles.userNameImage}>
              <img src={profileImg} alt="" />
              <p>u/{comment.owner.name}</p>
            </div>
          </Link>
          <p>{comment.creationDateTime.date.month}/{comment.creationDateTime.date.day}/{comment.creationDateTime.date.year}</p>
          { comment.editStatus.edited ?
            <p>Edited: {comment.editStatus.editDateTime.date.month}/{comment.editStatus.editDateTime.date.day}/{comment.editStatus.editDateTime.date.year}</p> :
            null
          }
        </>
      );
    }
    const commentActionsContainer = () => {
      const displayVoteButton = (type, symbol) => {
        return loggedIn && <p className={`${type}-icon`} onClick={(e) => actions.adjustVotesHandler(e)}>{symbol}</p>
      };
      const displayFavoriteButtons = () => {
        return (
          loggedIn ?
          currentUser.favorite.comments[comment.subName] &&
          currentUser.favorite.comments[comment.subName][comment.postUid] &&
          currentUser.favorite.comments[comment.subName][comment.postUid].includes(comment.uid) ?
          <p onClick={() => commentActions.unfavoriteComment(comment.subName, comment.postUid, comment.uid)}>Unfavorite</p> :
          <p onClick={() => commentActions.favoriteComment(comment.subName, comment.postUid, comment.uid)}>Favorite</p> :
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
          <p onClick={actions.deleteCommentHandler}>Delete</p> :
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
      const replyContainer = () => {
        document.querySelector(`.comment-reply-container-${comment.uid}`).classList.remove('hidden', styles.hidden);
      }
  
      return (
        <>
          <div>
            <div className={`votes-container ${styles.votesContainer}`}>
              { displayVoteButton('upvote', '^') }
              <p>{comment.votes}</p>
              { displayVoteButton('downvote', 'v') }
            </div>
  
            { loggedIn ? <p onClick={replyContainer}>Reply</p> : null }
  
            { displayFavoriteButtons() }
            <p className='share-btn' onClick={shareCommentHandler}>Share</p>
            { displayEditButton() }
          </div>
          <div>
            { displayDeleteButton() }
          </div>
        </>
      );
    }
    const editForm = () => {
      return (
        <>
          <textarea name="comment-text" id="comment-text" cols="30" rows="10" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>    
          <div>
            <button onClick={actions.cancelEditCommentHandler}>Cancel</button>
            <button onClick={actions.editCommentHandler}>Edit</button>
          </div>
        </>
      )
    }
    const replyContainer = () => {
      return (
        <>
          <textarea name="comment-reply" id="comment-reply" cols="30" rows="10"
            placeholder="What do you think?"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          >
          </textarea>
          <div>
            <button onClick={(e) => actions.cancelReply(e)}>Cancel</button>
            <button onClick={(e) => actions.commentReplyHandler(e)}>Reply</button>
          </div>
          <p className={`comment-error-msg-${comment.uid} hidden`}></p>
        </>
      );
    }
    const hideReplyContainer = () => {
      document.querySelector(`.comment-reply-container-${comment.uid}`).classList.add('hidden', styles.hidden);
    }

    const inputError = () => {
      const errorMsg = document.querySelector(`.comment-error-msg-${comment.uid}`);
  
      errorMsg.textContent = 'Error: Comment cannot be empty';
  
      setTimeout(() => {
        errorMsg.classList.add('hidden');
      }, 5000);
      errorMsg.classList.remove('hidden');
    }
    
    return { header, commentActionsContainer, editForm, replyContainer, hideReplyContainer, inputError }
  })();

  return (
    <div id={comment.uid} className={styles.wrapper}>
      <div className={styles.commentContainer}>
        <header className={styles.commentHeader}>
          { display.header() }
        </header>

        <div className={styles.commentText}>
          { editMode ?
            display.editForm():
            <p>{comment.text}</p>
          }
          <p className={`comment-error-msg-${comment.uid} hidden`}></p>
        </div>

        <div className={`comment-actions ${styles.commentActions}`}>
          { display.commentActionsContainer() }
        </div>

        <div className={`comment-reply-container-${comment.uid} ${styles.hidden} ${styles.commentReply}`}>
          { display.replyContainer() }
        </div>
      </div>
      
      <div className={styles.replies}>
        { 
          Object.values(comment.children).length > 0 ?
          Object.values(comments).map((nextComment) => {
            return comment.children.map((child) => {
              return nextComment.uid === child ?
              <Comment
              key={Object.values(nextComment).uid}
              comments={comments}
              comment={nextComment}
              commentReply={commentReply}
              commentActions={commentActions}
              storage={storage}
              /> :
              null
            })
          }) :
          null
        }
      </div>
    </div>
  );
};

export default Comment;