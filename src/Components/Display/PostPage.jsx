import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deleteObject, getDownloadURL, ref, updateMetadata } from 'firebase/storage';

import Navbar from './Navbar';
import Comment from './Comment';

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;

  button {
    padding: 7px 15px;
    cursor: pointer;
  }

  .hidden {
    display: none;
  }
`;
const PostSection = styled.div`
  position: relative;
  margin-bottom: 50px;
  padding: 30px 100px 95px;
  background-color: #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
`;
const Header = styled.div`
  display: flex;
  gap: 25px;
  position: relative;
  margin-bottom: 30px;
  
  a { color: #000; }

  p:nth-child(-n+2) span {
    margin-left: 5px;
    cursor: pointer;
  }
`;
const VoteStatus = styled.div`
  position: absolute;
  top: 0;
  left: -100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 40px;
  font-size: 0.875rem;
  background-color #fff;
  border-radius: 0 8px 8px 0;

  p:nth-child(2n+1) {
    cursor: pointer;
  }
`;
const Body = styled.div`
  position: relative;

  h2 {
    margin-bottom: 40px;
    font-size: 2rem;
  }

  > div p:nth-child(2) { font-size: 1.25rem; }

  input, textarea {
    width: 100%;
    margin-bottom: 80px;
    padding: 8px;
  }

  img { width: 100%; }

  div:first-child {
    position: relative;

    .post-error-msg {
      position: absolute;
      bottom: -20px;
      color: red;
    }
  }
`;
const PostActions = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  padding: 9px 25px;
  background-color: #fff;
  border-radius: 0 8px 0 8px;

  div {
    display: flex;
    gap: 25px;

    &:nth-child(2) p {
      cursor: pointer;
    }
  }

  .link-copied-msg {
    position: absolute;
    top: -30px;
    right: -60px;
    text-align: center;
    font-size: 0.9rem;
    background-color: #fff;
  }
`;
const CommentSection = styled.div`
  padding: 20px 0;
  
  .comment-error-msg {
    color: red;
  }
`;
const CompositionContainer = styled.div`
  margin: 60px auto 80px;
  padding: 0 40px;

  p {
    margin-bottom: 10px;
  }

  textarea {
    width: 100%;
    padding: 10px;
  }

`;
const CommentsContainer = styled.div`
  > div:first-child {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 0.9rem;

    ul {
      display: flex;
      gap: 15px;

      li { cursor: pointer; }
    }
  }
`;
const SortOptions = styled.div`
  margin-bottom: 20px;
  border-bottom: 5px solid #d9d9d9;

  ul {
    display: flex;
    gap: 25px;

    li {
      padding: 0 4px 9px;
      cursor: pointer;
    }
  }

  .selected-sort {
    
  }
`;

function PostPage({ loggedIn, signInOut, currentUser, userList, subList, favoritePost, unfavoritePost, editPost, deletePost, addComment, favoriteComment, unfavoriteComment, editComment, deleteComment, adjustPostVotes, adjustCommentVotes, uploadImage, storage }) {
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
  
  const deleteImageFromStorage = () => {
    const prevImgRef = ref(storage, postContent);

    deleteObject(prevImgRef)
      .then(() => console.log('image deleted'))
      .catch((err) => console.log('error', err));
  }
  const displayTextPost = () => {
    return (
      <Body>
        <div>
          <h2>{post.title}</h2>
          { editMode ?
            <textarea name="new-post-content" id="new-post-content" cols="30" rows="10" value={postContent} onChange={(e) => setPostContent(e.target.value)}></textarea> :
            <p>{post.content}</p>
          }
        </div>
      </Body>
    );
  }
  const displayImagePost = () => {
    const pathRef = ref(storage, post.content);
    getDownloadURL(pathRef).then((url) => {
      setPostContent(url);
    });

    return (
      <Body>
        <div>
          <h2>{post.title}</h2>
          { editMode ?
            <input type="file" name="new-post-content" id="new-post-content" onChange={(e) => setEditedPostContent(e.target.files[0])} /> :
            <img src={''} alt="" id='post-image' />
          }
          <p className='post-error-msg hidden'></p>
        </div>
      </Body>
    );
  }
  const displayLinkPost = () => {
    return (
      <Body>
        <div>
          <h2>{post.title}</h2>
          { editMode ?
            <input type="url"name="new-post-content" id="new-post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} /> :
            <Link to={post.content}>
              <p>{post.content}</p>
            </Link>
          }
          <p className='post-error-msg hidden'></p>
        </div>
      </Body>
    );
  }
  const displayPostActions = () => {
    const displayFavoriteButtons = () => {
      return (
        loggedIn ?
        currentUser.favorite.posts[subName] && currentUser.favorite.posts[subName].includes(post.uid) ?
        <p onClick={() => unfavoritePost(subName, post.uid)}>Unfavorite</p> :
        <p onClick={() => favoritePost(subName, post.uid)}>Favorite</p> :
        null
      );
    };
    const displayEditButton = () => {
      return (
        (loggedIn && post.owner.uid === currentUser.uid) &&
        <p onClick={setEditModeHandler}>Edit</p>
      );
    };
    const displayDeleteButton = () => {
      return (
        (loggedIn && post.owner.uid === currentUser.uid) ||
        (loggedIn && subList[post.subName].moderators.includes(currentUser.uid)) ?
        <p onClick={deletePostHandler}>Delete</p> :
        null
      );
    };
    const sharePostHandler = () => {
      navigator.clipboard.writeText(window.location.href);

      const shareBtn = document.getElementById(`post-${post.uid}`).querySelector('.share-btn');
      shareBtn.textContent = 'Link copied';
      setTimeout(() => shareBtn.textContent = 'Share', 5000);
    }

    return (
      <>
        { displayFavoriteButtons() }
        <p className='share-btn' onClick={sharePostHandler}>Share</p>
        { displayEditButton() }
        { displayDeleteButton() }
      </>
    );
  }
  const displayEditActions = () => {
    return (
      <>
        <button onClick={cancelEditPostHandler}>Cancel</button>
        <button onClick={editPostHandler}>Edit</button>
      </>
    )
  }

  const setEditModeHandler = () => {
    setEditMode(true);
  }
  const editPostHandler = async () => {
    const isFileTooLarge = (fileSize) => fileSize > (20 * 1024 * 1024);

    if ((post.type === 'images/videos' && (editedPostContent === '' || editedPostContent === undefined)) || (post.type === 'link' && postContent === '')) return displayInputError('post');
    if (post.type === 'images/videos' && isFileTooLarge(editedPostContent.size)) return displayInputError('post', 'too large');
    if (post.type === 'images/videos' && editedPostContent['type'].split('/')[0] !== 'image' ) return displayInputError('post', 'not image');

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
          displayInputError('post', 'not image');
          console.log('Error: File is not image', err);
        } else {
          displayInputError('post', 'too large');
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
  const deletePostHandler = () => {
    // display popup confirmation
    if ((post.owner.uid === currentUser.uid) || (subList[post.subName].moderators.includes(currentUser.uid))) {
      deletePost(subName, post.uid);
    }
    navigate(`/r/${subName}`);
  }
  
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
  const adjustCommentVotesHandler = (num, comment, currentUserCopy) => {
    adjustCommentVotes(num, comment, currentUserCopy);
  }

  const sortComments = (e) => {
    const commentsCopy = [...comments];
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

    if (commentInput === '') return displayInputError('comment');

    addComment(commentInput, post.uid, subName);
    setCommentInput('');
  }
  const displayInputError = (type, reason=null) => {
    const errorMsg = document.querySelector(`.${type}-error-msg`);

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
  const commentReplyHandler = (replyText, parentComment) => {
    addComment(replyText, post.uid, subName, parentComment);
  }
  const getComments = () => {
    return Object.values(comments).map((comment) => {
      return (
        !comment.parentUid ?
        <Comment
          key={comment.uid}
          loggedIn={loggedIn}
          currentUser={currentUser}
          userList={userList}
          subList={subList}
          comments={post.comments}
          comment={comment}
          commentReply={commentReplyHandler}
          favoriteComment={favoriteComment}
          unfavoriteComment={unfavoriteComment}
          editComment={editComment}
          deleteComment={deleteComment}
          adjustCommentVotes={adjustCommentVotesHandler}
          storage={storage}
        /> :
        null
      )
    }).filter((comment) => comment);
  }
  const getNumComments = () => Object.keys(post.comments).length;

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut}currentUser={currentUser} subList={subList} />

      <Wrapper id={`post-${post.uid}`}>
        {
          loading ?
          <p>Loading...</p> :
          <>
            <PostSection>
              <Header>
                <Link to={`/r/${subName}`} className='default-link'>
                  <p>/r/{subName}</p>
                </Link>
                <p>Posted by
                  <Link to={`/u/${post.owner.uid}/${post.owner.name}`} className='default-link'>
                    <span>u/{post.owner.name}</span>
                  </Link>
                </p>
                <p>{ post.creationDateTime.date.month}/{post.creationDateTime.date.day}/{post.creationDateTime.date.year }</p>
                { post.editStatus.edited ?
                  <p>Edited: {post.editStatus.editDateTime.date.month}/{post.editStatus.editDateTime.date.day}/{post.editStatus.editDateTime.date.year}</p> :
                  null
                }

                <VoteStatus>
                  { loggedIn && <p className="upvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>^</p> }
                  <p>{post.votes}</p>
                  { loggedIn && <p className="downvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>v</p> }
                </VoteStatus>
              </Header>

              { 
                post.type === 'link' ?
                displayLinkPost() :
                post.type === 'images/videos' ?
                displayImagePost() :
                displayTextPost()
              }
              <PostActions>
                <div>
                  <p>{getNumComments() === 1 ? getNumComments() + ' Comment' : getNumComments() + ' Comments'}</p>
                </div>
                <div>
                  { editMode ?
                    displayEditActions() :
                    displayPostActions()
                  }
                </div>
              </PostActions>
            </PostSection>

            <CommentSection>
              {
                loggedIn &&
                <CompositionContainer>
                  <p>Comment as u/{currentUser.name}</p>
                  <form action="#">
                    <textarea name="comment-text" id="comment-text" cols="30" rows="10" value={commentInput} onChange={(e) => setCommentInput(e.target.value)}></textarea>
                    <button onClick={(e) => addCommentHandler(e)}>Submit</button>
                  </form>
                  <p className='comment-error-msg hidden'></p>
                </CompositionContainer>
              }
              
              <CommentsContainer>
                <SortOptions>
                  <ul>
                    <li onClick={(e) => sortComments(e)}>Highest Rating</li>
                    <li onClick={(e) => sortComments(e)}>Lowest Rating</li>
                    <li onClick={(e) => sortComments(e)}>Oldest</li>
                    <li onClick={(e) => sortComments(e)}>Newest</li>
                  </ul>
                </SortOptions>
                {
                  getComments()
                }
              </CommentsContainer>
            </CommentSection>
          </>
        }
      </Wrapper>
    </div>
  );
};

export default PostPage;