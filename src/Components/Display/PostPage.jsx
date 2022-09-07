import { useParams, useNavigate, Link } from 'react-router-dom';

import Navbar from './Navbar';
import Comment from './Comment';
import styled from "styled-components";
import { useEffect, useState } from 'react';

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  display: flex;
  gap: 40px;
  position: relative;
  padding: 20px 0;

  p:nth-child(-n+2) {
    cursor: pointer;
  }
`;
const VoteStatus = styled.div`
  position: absolute;
  top: 100px;
  left: 25px;

  p:nth-child(2n+1) {
    cursor: pointer;
  }
`;
const Body = styled.div`
  padding: 40px 80px 0;
  background-color: #ccc;

  h2 {
    margin-bottom: 40px;
    font-size: 2.4rem;
  }

  > div p {
    margin-bottom: 80px;
  }
`;
const PostActions = styled.div`
  display: flex;
  justify-content: space-between;

  div {
    display: flex;
    gap: 20px;

    p {
      margin-bottom: 40px;
    }

    &:nth-child(2) p {
      cursor: pointer;
    }
  }
`;
const CommentSection = styled.div`
  padding: 20px 0;
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
  padding: 0 40px;

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

function PostPage({ loggedIn, currentUser, subList, favoritePost, unfavoritePost, deletePost, addComment, favoriteComment, unfavoriteComment, deleteComment, adjustPostVotes, adjustCommentVotes }) {
  const params = useParams();
  const navigate = useNavigate();

  const [subName, setSubName] = useState(null);
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sub = Object.values(subList).filter((sub) => {
      return sub.name === params.subName;
    })[0];

    const currentPost = (Object.values(sub.posts).filter((post) => post.uid === params.postUid)[0]);

    setSubName(sub.name);
    setPost(currentPost);
    setComments(Object.values(currentPost.comments));
  }, [subList]);

  useEffect(() => {

    setLoaded(true);
  }, [post])

  const addCommentHandler = (e) => {
    e.preventDefault();

    addComment(commentInput, post.uid, subName);
    setCommentInput('');
  }

  const commentReplyHandler = (replyText, parentComment) => {
    addComment(replyText, post.uid, subName, parentComment);
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
      commentsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
      
    }
    if (e.target.textContent === 'Newest') {
      commentsCopy.sort((a, b) => a.creationDateTime.fullDateTime - b.creationDateTime.fullDateTime);

    }

    setComments(commentsCopy);
  }

  const deletePostHandler = () => {
    // display popup confirmation
    if (post.owner.uid === currentUser.uid) deletePost(subName, post.uid);
    navigate(`/r/${subName}`);
  }

  const adjustPostVotesHandler = (e) => {
    adjustPostVotes(e.target.className === "upvote-icon" ? 1 : -1 , post.uid, post.subName);
  }
  const adjustCommentVotesHandler = (num, comment, currentUserCopy) => {
    adjustCommentVotes(num, comment, post.uid, subName, currentUserCopy);
  }

  const getComments = () => {
    return Object.values(comments).map((comment) => {
      return (
        !comment.parentUid ?
        <Comment
          key={comment.uid}
          loggedIn={loggedIn}
          currentUser={currentUser}
          comments={post.comments}
          comment={comment}
          commentReply={commentReplyHandler}
          favoriteComment={favoriteComment}
          unfavoriteComment={unfavoriteComment}
          deleteComment={deleteComment}
          adjustCommentVotes={adjustCommentVotesHandler}
        /> :
        null
      )
    }).filter((comment) => comment);
  }
  const getNumComments = () => Object.keys(post.comments).length;

  return (
    <div>
      <Navbar currentUser={currentUser} subList={subList} />

      <Wrapper>
        {
          loaded ?
          <>
            <Header>
              <Link to={`/r/${subName}`}>
                <p>/r/{subName}</p>
              </Link>
              <p>Posted by
                <Link to={`/u/${post.owner.uid}/${post.owner.name}`}>
                  u/{post.owner.name}
                </Link>
              </p>
              <p>{post.creationDateTime.date.month}/{post.creationDateTime.date.day}/{post.creationDateTime.date.year}</p>

              <VoteStatus>
                { loggedIn && <p className="upvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>^</p> }
                <p>{post.votes}</p>
                { loggedIn && <p className="downvote-icon" onClick={(e) => adjustPostVotesHandler(e)}>v</p> }
              </VoteStatus>
            </Header>
            <Body>
              <div>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
              </div>

              <PostActions>
                <div>
                  <p>{getNumComments() === 1 ? getNumComments() + ' comment' : getNumComments() + ' comments'}</p>
                </div>
                <div>
                  { loggedIn ?
                    currentUser.favorite.posts[subName] && currentUser.favorite.posts[subName].includes(post.uid) ?
                    <p onClick={() => unfavoritePost(subName, post.uid)}>Unfavorite</p> :
                    <p onClick={() => favoritePost(subName, post.uid)}>Favorite</p> :
                    null
                  }
                  <p>Share</p>
                  { loggedIn && post.owner.uid === currentUser.uid && <p onClick={deletePostHandler}>Delete</p> }
                </div>
              </PostActions>
            </Body>
            <CommentSection>
              {
                loggedIn &&
                <CompositionContainer>
                  <p>Comment as u/{currentUser.name}</p>
                  <form action="#">
                    <textarea name="comment-text" id="comment-text" cols="30" rows="10" value={commentInput} onChange={(e) => setCommentInput(e.target.value)}></textarea>
                    <button onClick={(e) => addCommentHandler(e)}>Submit</button>
                  </form>
                </CompositionContainer>
              }
              <CommentsContainer>
                <div>
                  <p>Sort:</p>
                  <ul>
                    <li onClick={(e) => sortComments(e)}>Highest Rating</li>
                    <li onClick={(e) => sortComments(e)}>Lowest Rating</li>
                    <li onClick={(e) => sortComments(e)}>Oldest</li>
                    <li onClick={(e) => sortComments(e)}>Newest</li>
                  </ul>
                </div>
                {
                  getComments()
                }
              </CommentsContainer>
            </CommentSection>
          </> :
          <p>Loading...</p>
        }
      </Wrapper>
    </div>
  );
};

export default PostPage;