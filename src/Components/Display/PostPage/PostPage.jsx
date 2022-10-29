import { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deleteObject, getDownloadURL, ref, updateMetadata } from 'firebase/storage';

import { LogInOutContext } from '../../Contexts/LogInOutContext';
import { UserContext } from '../../Contexts/UserContext';
import { SubContext } from '../../Contexts/SubContext';
import { PostContext } from '../../Contexts/PostContext';
import Navbar from '../Navbar/Navbar';
import Comment from '../Comment/Comment';

import styles from './PostPage.module.css';

function PostPage({ commentActions, uploadImage, storage }) {
  const params = useParams();
  const navigate = useNavigate();

  const [subName, setSubName] = useState(null);
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [editedPostContent, setEditedPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  const { loggedIn } = useContext(LogInOutContext);
  const { currentUser } = useContext(UserContext);
  const { subList } = useContext(SubContext);
  const { editPost, deletePost, adjustPostVotes, favoritePost, unfavoritePost } = useContext(PostContext);

  useEffect(() => {
    if (Object.values(subList).length === 0) return;

    const sub = Object.values(subList).filter((sub) => {
      return sub.name === params.subName;
    })[0];

    const currentPost = (Object.values(sub.posts).filter((post) => post.uid === params.postUid)[0]);

    setSubName(sub.name);
    setPost(currentPost);
    setComments(Object.values(currentPost.comments));
  }, [subList]);
  useEffect(() => {
    if (Object.values(post).length === 0) return;

    setPostContent(post.content);
    setLoading(false);
  }, [post]);
  useEffect(() => {
    if (post.type === 'images/videos') document.getElementById('post-image').setAttribute('src', postContent);
  }, [postContent]);

  const actions = (() => {
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
    
    const sortComments = (e) => {
      const commentsCopy = [...comments];
      if (document.querySelector('.selected-sort')) document.querySelector('.selected-sort').classList.remove('selected-sort', styles.selectedSort);
      e.target.classList.add(`selected-sort`, styles.selectedSort);

      if (e.target.textContent === 'Highest Rating') {
        commentsCopy.sort((a, b) => b.votes - a.votes);
      }
      if (e.target.textContent === 'Lowest Rating') {
        commentsCopy.sort((a, b) => a.votes - b.votes);
      }
      if (e.target.textContent === 'Oldest') {
        commentsCopy.sort((a, b) => a.creationDateTime.fullDateTime - b.creationDateTime.fullDateTime);
        
      }
      if (e.target.textContent === 'Newest') {
        commentsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);

      }

      setComments(commentsCopy);
    }
    const addCommentHandler = (e) => {
      e.preventDefault();

      if (commentInput === '') return display.inputError('comment');

      commentActions.addComment(commentInput, post.uid, subName);
      setCommentInput('');
    }
    const commentReplyHandler = (replyText, parentComment) => {
      commentActions.addComment(replyText, post.uid, subName, parentComment);
    }

    return { adjustPostVotesHandler, sortComments, addCommentHandler, commentReplyHandler }
  })();

  const display = (() => {
    const inputError = (type, reason=null) => {
      const errorMsg = document.querySelector(`.${type}ErrorMsg`);
  
      if (reason === 'too large') {
        errorMsg.textContent = 'Error: File size too large. Max 20MB';
      } else if (reason === 'not image') {
        errorMsg.textContent = `Error: File is not an image`;
      } else {
        errorMsg.textContent = `Error: ${type} content cannot be empty`;
      }
  
      setTimeout(() => {
        errorMsg.classList.add('hidden');
      }, 5000);
      errorMsg.classList.remove('hidden');
    }

    const postsSection = () => {
      const header = () => {
        const creationDetails = () => {
          return (
            <>
              <Link to={`/r/${subName}`} className='default-link'>
                <p>r/{subName}</p>
              </Link>
              <p>Posted by
                <Link to={`/u/${post.owner.uid}/${post.owner.name}`} className='default-link'>
                  <span>u/{post.owner.name}</span>
                </Link>
              </p>
              <p>{ post.creationDateTime.date.month}/{post.creationDateTime.date.day}/{post.creationDateTime.date.year }</p>
            </>
          );
        }
        const editStats = () => {
          return (
            post.editStatus.edited ?
            <p>Edited: {post.editStatus.editDateTime.date.month}/{post.editStatus.editDateTime.date.day}/{post.editStatus.editDateTime.date.year}</p> :
            null
          );
        }
        const voteContainer = () => {
          return (
            <div className={styles.voteStatus}>
              { loggedIn && <p className="upvote-icon" onClick={(e) => actions.adjustPostVotesHandler(e)}>^</p> }
              <p>{post.votes}</p>
              { loggedIn && <p className="downvote-icon" onClick={(e) => actions.adjustPostVotesHandler(e)}>v</p> }
            </div>
          );
        }
  
        return (
          <header>
            { creationDetails() }
            { editStats() }
            { voteContainer() }
          </header>
        );
      };
      const body = () => {
        const textPost = () => {
          return (
            <body>
              <div>
                <h2>{post.title}</h2>
                { editMode ?
                  editForm('text') :
                  <p>{post.content}</p>
                }
              </div>
            </body>
          );
        }
        const imagePost = () => {
          const pathRef = ref(storage, post.content);
          getDownloadURL(pathRef).then((url) => {
            setPostContent(url);
          });
      
          return (
            <body>
              <div>
                <h2>{post.title}</h2>
                { editMode ?
                  editForm('image') :
                  <img src={''} alt="" id='post-image' />
                }
                <p className='post-error-msg hidden'></p>
              </div>
            </body>
          );
        }
        const linkPost = () => {
          return (
            <body>
              <div>
                <h2>{post.title}</h2>
                { editMode ?
                  editForm('link') :
                  <Link to={post.content}>
                    <p>{post.content}</p>
                  </Link>
                }
                <p className='post-error-msg hidden'></p>
              </div>
            </body>
          );
        }
        const editForm = (type) => {
          const editPostHandler = async () => {
            const isFileTooLarge = (fileSize) => fileSize > (20 * 1024 * 1024);
            const deleteImageFromStorage = () => {
              const prevImgRef = ref(storage, postContent);
          
              deleteObject(prevImgRef)
                .then(() => console.log('image deleted'))
                .catch((err) => console.log('error', err));
            }
        
            if ((post.type === 'images/videos' && (editedPostContent === '' || editedPostContent === undefined)) || (post.type === 'link' && postContent === '')) return inputError('post');
            if (post.type === 'images/videos' && isFileTooLarge(editedPostContent.size)) return inputError('post', 'too large');
            if (post.type === 'images/videos' && editedPostContent['type'].split('/')[0] !== 'image' ) return inputError('post', 'not image');
        
            const editedPost = {...post};
        
            if (post.type === 'images/videos') {
              const storageRef = ref(storage, `images/posts/${subName}/${editedPostContent.name}-${post.uid}`);
              await uploadImage(storageRef, editedPostContent);
              
              getDownloadURL(storageRef).then((url) => {
                editedPost.content = `images/posts/${subName}/${editedPostContent.name}-${post.uid}`;
                setPost(editedPost);
                setPostContent(editedPost.content);
                
                editPost(editedPost);
        
                updateMetadata(storageRef, { customMetadata: { owner: currentUser.uid, subName: subName } });
                deleteImageFromStorage();
              }).catch((err) => {
                if (editedPostContent['type'].split('/')[0] !== 'image') {
                  inputError('post', 'not image');
                  console.log('Error: File is not image', err);
                } else {
                  inputError('post', 'too large');
                  console.log('Error: Image too large', err);
                }
              });
            } else {
              editedPost.content = postContent;
              setPost(editedPost);
              setPostContent(editedPost.content);
        
              editPost(editedPost);
            }
        
            setEditMode(false);
          }
          const cancelEditPostHandler = () => {
            setEditMode(false);
            setPostContent(post.content);
          }
    
          return (
            <>
              {
                type === 'image' ?
                <input type="file" name="new-post-content" id="new-post-content" onChange={(e) => setEditedPostContent(e.target.files[0])} /> :
                type === 'link' ?
                <input type="url"name="new-post-content" id="new-post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} /> :
                <textarea name="new-post-content" id="new-post-content" cols="30" rows="10" value={postContent} onChange={(e) => setPostContent(e.target.value)}></textarea>
              }
              <div className={styles.editFormBtns}>
                <button onClick={cancelEditPostHandler}>Cancel</button>
                <button onClick={editPostHandler}>Edit</button>
              </div>
            </>
          )
        }
  
        return (
          post.type === 'link' ?
          linkPost() :
          post.type === 'images/videos' ?
          imagePost() :
          textPost()
        );
      };
      const postActionsContainer = () => {
        const sharePostHandler = () => {
          navigator.clipboard.writeText(window.location.href);
    
          const shareBtn = document.getElementById(`post-${post.uid}`).querySelector('.share-btn');
          shareBtn.textContent = 'Link copied';
          setTimeout(() => shareBtn.textContent = 'Share', 5000);
        }
        const getNumComments = () => Object.keys(post.comments).length;

        const display = () => {
          const favoriteButtons = () => {
            return (
              loggedIn ?
              currentUser.favorite.posts[subName] && currentUser.favorite.posts[subName].includes(post.uid) ?
              <p onClick={() => unfavoritePost(subName, post.uid)}>Unfavorite</p> :
              <p onClick={() => favoritePost(subName, post.uid)}>Favorite</p> :
              null
            );
          };
          const editButton = () => {
            return (
              (loggedIn && post.owner.uid === currentUser.uid) &&
              <p onClick={() => setEditMode(true)}>Edit</p>
            );
          };
          const deleteButton = () => {
            const deletePostHandler = () => {
              // display popup confirmation
              if ((post.owner.uid === currentUser.uid) || (subList[post.subName].moderators.includes(currentUser.uid))) {
                deletePost(subName, post.uid);
              }
              navigate(`/r/${subName}`);
            }
  
            return (
              (loggedIn && post.owner.uid === currentUser.uid) ||
              (loggedIn && subList[post.subName].moderators.includes(currentUser.uid)) ?
              <p onClick={deletePostHandler}>Delete</p> :
              null
            );
          };
      
          return (
            <div className={styles.postActions}>
              <div>
                <p>{getNumComments() === 1 ? getNumComments() + ' Comment' : getNumComments() + ' Comments'}</p>
                { favoriteButtons() }
                <p className='share-btn' onClick={sharePostHandler}>Share</p>
                { editButton() }
              </div>
              <div>
                { deleteButton() }
              </div>
            </div>
          );
        }
  
        return display();
      };
  
      return (
        <div className={styles.postSection}>
          { header() }
          { body() }
          { postActionsContainer() }
        </div>
      );
    };
    const commentsSection = () => {
      const getComments = () => {
        return Object.values(comments).map((comment) => {
          return (
            !comment.parentUid ?
            <Comment
              key={comment.uid}
              comments={post.comments}
              comment={comment}
              commentReply={actions.commentReplyHandler}
              commentActions={commentActions}
              storage={storage}
            /> :
            null
          )
        }).filter((comment) => comment);
      }
      const compositionContainer = () => {
        return (
          <>
            <p>Comment as u/{currentUser.name}</p>
            <form action="#">
              <textarea name="comment-text" id="comment-text" cols="30" rows="10" placeholder="What do you think?" value={commentInput} onChange={(e) => setCommentInput(e.target.value)}></textarea>
              <div>
                <button onClick={(e) => actions.addCommentHandler(e)}>Submit</button>
              </div>
            </form>
            <p className='comment-error-msg hidden'></p>
          </>
        );
      }
      const sortOptions = () => {
        return (
          <ul>
            <li onClick={(e) => actions.sortComments(e)}>Highest Rating</li>
            <li onClick={(e) => actions.sortComments(e)}>Lowest Rating</li>
            <li onClick={(e) => actions.sortComments(e)}>Oldest</li>
            <li onClick={(e) => actions.sortComments(e)}>Newest</li>
          </ul>
        );
      }
  
      return (
        <div className={styles.commentSection}>
          {
            loggedIn &&
            <div className={styles.compositionContainer}>
              { compositionContainer() }
            </div>
          }
          
          <div className={styles.commentsContainer}>
            <div className={styles.sortOptions}>
              { sortOptions() }
            </div>

            { getComments() }
          </div>
        </div>
      );
    }

    return { postsSection, commentsSection }
  })();

  return (
    <div>
      <Navbar />

      <div id={`post-${post.uid}`} className={styles.wrapper}>
        {
          loading ?
          <p>Loading...</p> :
          <>
            { display.postsSection() }
            { display.commentsSection() }
          </>
        }
      </div>
    </div>
  );
};

export default PostPage;