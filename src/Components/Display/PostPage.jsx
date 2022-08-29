import { useParams, Link } from 'react-router-dom';
import uniqid from 'uniqid';

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
  padding: 20px 0;

  p:nth-child(-n+2) {
    cursor: pointer;
  }
`;
const Body = styled.div`
  padding: 40px 40px 100px;
  background-color: #ccc;

  h2 {
    margin-bottom: 40px;
    font-size: 2.8rem;
  }

  p {
    margin-bottom: 20px;
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

function PostPage({ loggedIn, subList, adjustPostVotes, adjustCommentVotes }) {
  const params = useParams();

  const [subName, setSubName] = useState(null);
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sub = Object.values(subList).filter((sub) => {
      return sub.name.split(' ').join('_').toLowerCase() === params.subName;
    })[0];

    const post = (Object.values(sub.posts).filter((post) => post.uid === params.postUid)[0]);

    post.addComment(uniqid(), 'xdemonslayerx', 'look a comment', 2);
    post.addComment(uniqid(), 'xdemonslayerx', 'look a comment', 5);
    post.addComment(uniqid(), 'xdemonslayerx', 'look a comment', 10);
    post.addComment(uniqid(), 'xdemonslayerx', 'look a comment', 1);
    
    setSubName(sub.name);
    setPost(post);
    setComments(Object.values(post.comments));
  }, []);

  useEffect(() => {

    setLoaded(true);
  }, [post])

  const addComment = (e) => {
    e.preventDefault();

    const sub = Object.values(subList).filter((sub) => {
      return sub.name.split(' ').join('_').toLowerCase() === params.subName;
    })[0];

    const post = (Object.values(sub.posts).filter((post) => post.uid === params.postUid)[0]);

    post.addComment(uniqid(), 'userName', commentInput, 11);
    setCommentInput(null);
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

  const adjustPostVotesHandler = () => {

  }

  const adjustCommentVotesHandler = (num, commentUid) => {
    adjustCommentVotes(num, commentUid, post.uid, subName);
  }

  const getComments = () => {
    return Object.values(comments).map((comment) => {
      return <Comment loggedIn={loggedIn} comment={comment} adjustCommentVotes={adjustCommentVotesHandler} />
    });
  }

  return (
    <div>
      <Navbar />

      <Wrapper>
        {
          loaded ?
          <>
            <Header>
              <Link to={`/r/${subName.split(' ').join('_').toLowerCase()}`}>
                <p>/r/{subName}</p>
              </Link>
              <p>Posted by u/{post.owner}</p>
              <p>{post.creationDateTime.date.month}/{post.creationDateTime.date.day}/{post.creationDateTime.date.year}</p>
            </Header>
            <Body>
              <div>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
              </div>
            </Body>
            <CommentSection>
              {
                loggedIn &&
                <CompositionContainer>
                  <p>Comment as u/username</p>
                  <form action="#">
                    <textarea name="comment-text" id="comment-text" cols="30" rows="10" value={commentInput} onChange={(e) => setCommentInput(e.target.value)}></textarea>
                    <button onClick={(e) => addComment(e)}>Submit</button>
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