import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, getDownloadURL } from 'firebase/storage';

import styles from './PostPreview.module.css';



function PostPreview({ loggedIn, currentUser, post, favoritePost, unfavoritePost, adjustPostVotes, storage }) {
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    if (post.type === 'images/videos' && storage) {
      const pathRef = ref(storage, post.content);
      let attempt = 0;

      const getImage = () => {
        getDownloadURL(pathRef).then((url) => {
          setPostContent(url);
        }).catch((err) => {
          attempt += 1;
          if (attempt >= 5) return console.log('error retrieving image', err);

          console.log('error retrieving image, retrying...', err);
          setTimeout(() => getImage(), 3000);
        });
      }

      getImage();
    } else {
      setPostContent(post.content);
    }
  }, [storage]);

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
  const sharePostHandler = () => {
    navigator.clipboard.writeText(`${window.location.href}/${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`);

    const shareBtn = document.getElementById(`post-${post.uid}`).querySelector('.share-btn');
    shareBtn.textContent = 'Link copied';
    setTimeout(() => shareBtn.textContent = 'Share', 5000);
  }
  const getNumComments = () => Object.keys(post.comments).length;

  return (
    <div id={`post-${post.uid}`} className={styles.wrapper}>
      <header>
        <p>Posted by
          <Link to={`/u/${post.owner.uid}/${post.owner.name}`} className='default-link'>
            u/{post.owner.name}
          </Link>
          </p>
        <p>{`${post.creationDateTime.date.month}/${post.creationDateTime.date.day}/${post.creationDateTime.date.year}`}</p>
      </header>
      <body>
        <h4>{post.title}</h4>
        { post.type === 'images/videos' ?
          <img src={postContent} alt="" /> :
          <p>{postContent}</p>
        }
      </body>
      <div className={styles.options}>
        <p>{getNumComments() === 1 ? getNumComments() + ' Comment' : getNumComments() + ' Comments'}</p>
        { loggedIn ?
          currentUser.favorite.posts[post.subName] && currentUser.favorite.posts[post.subName].includes(post.uid) ?
          <p onClick={() => unfavoritePost(post.subName, post.uid)}>Unfavorite</p> :
          <p onClick={() => favoritePost(post.subName, post.uid)}>Favorite</p> :
          null
        }
        <p className='share-btn' onClick={sharePostHandler}>Share</p>
      </div>
      <div className={styles.voteStatus}>
        { loggedIn && <p className="upvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>^</p> }
        <p>{post.votes}</p>
        { loggedIn && <p className="downvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>v</p> }
      </div>
    </div>
  );
};

export default PostPreview;