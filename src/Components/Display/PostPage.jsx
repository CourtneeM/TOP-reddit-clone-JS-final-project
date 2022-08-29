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

  > p {
    margin-bottom: 20px;
    font-size: 0.9rem;
  }
`;

function PostPage({ loggedIn, subList }) {
  const params = useParams();

  const [subName, setSubName] = useState(null);
  const [post, setPost] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sub = Object.values(subList).filter((sub) => {
      return sub.name.split(' ').join('_').toLowerCase() === params.subName;
    })[0];

    const post = (Object.values(sub.posts).filter((post) => post.uid === params.postUid)[0]);

    post.addComment(uniqid(), 'xdemonslayerx', 'look a comment');
    
    setSubName(sub.name);
    setPost(post);
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

    post.addComment(uniqid(), 'userName', commentInput);
    setCommentInput(null);
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
                <p>Sort Options: Highest Rating | Lowest Rating | Oldest | Newest</p>
                {
                  Object.values(post.comments).map((comment) => {
                    return <Comment comment={comment} />
                  })
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