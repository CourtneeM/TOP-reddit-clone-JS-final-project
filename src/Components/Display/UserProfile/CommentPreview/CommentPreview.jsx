import { useContext, useState, useEffect } from "react";
import { HashLink as Link } from "react-router-hash-link";
import { getDownloadURL, ref } from "firebase/storage";

import { LogInOutContext } from "../../../Contexts/LogInOutContext";
import { UserContext } from "../../../Contexts/UserContext";
import { SubContext } from "../../../Contexts/SubContext";
import { CommentContext } from "../../../Contexts/CommentContext";

import styles from './CommentPreview.module.css';

function CommentPreview({ comments, comment }) {
  const [profileImg, setProfileImg] = useState('');

  const { loggedIn } = useContext(LogInOutContext);
  const { userList, currentUser } = useContext(UserContext);
  const { subList, storage } = useContext(SubContext);
  const { adjustCommentVotes, favoriteComment, unfavoriteComment } = useContext(CommentContext);

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
    
    return { adjustVotesHandler }
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
          <p onClick={() => unfavoriteComment(comment.subName, comment.postUid, comment.uid)}>Unfavorite</p> :
          <p onClick={() => favoriteComment(comment.subName, comment.postUid, comment.uid)}>Favorite</p> :
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
            <div className={`votes-container ${styles.votesContainer}`}>
              { displayVoteButton('upvote', '^') }
              <p>{comment.votes}</p>
              { displayVoteButton('downvote', 'v') }
            </div>
            { displayFavoriteButtons() }
            <p className='share-btn' onClick={shareCommentHandler}>Share</p>
          </div>

        </>
      );
    }
   
    return { header, commentActionsContainer }
  })();

  return (
    <div id={comment.uid} className={styles.wrapper}>
      <div className={styles.commentContainer}>
        <header className={styles.commentHeader}>
          { display.header() }
        </header>

        <div className={styles.commentText}>
          <Link to={`/r/${comment.subName}/${comment.postUid}/${subList[comment.subName].posts[comment.postUid].title.split(' ').join('_').toLowerCase()}/#${comment.uid}`} key={comment.uid} className='default-link'>
            <p>{comment.text}</p>
          </Link>
        </div>

        <div className={`comment-actions ${styles.commentActions}`}>
          { display.commentActionsContainer() }
        </div>
      </div>
      
      <div className={styles.replies}>
        { 
          Object.values(comment.children).length > 0 ?
          Object.values(comments).map((nextComment) => {
            return comment.children.map((child) => {
              return nextComment.uid === child ?
              <CommentPreview
              key={Object.values(nextComment).uid}
              comments={comments}
              comment={nextComment}
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

export default CommentPreview;