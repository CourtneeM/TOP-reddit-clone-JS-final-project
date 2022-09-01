import { useParams, Link } from 'react-router-dom';

import PostPreview from "./PostPreview";
import AboutSection from "./AboutSection";
import Navbar from "./Navbar";

import styled from "styled-components";
import { useEffect, useState } from 'react';


const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 60%;
  min-width: 800px;
  margin: 0 auto 80px;
  padding: 40px;
  background-color: #ccc;
`;
const Header = styled.div`
  flex: 1 1 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;

  p:first-child {
    font-size: 1.4rem;
    font-weight: bold;
  }

  p:last-child {
    cursor: pointer;
  }
`;
const PostsSection = styled.div`
  flex: 75%
`;
const SortOptions = styled.div`
  margin: 0 80px 20px 0;
  padding: 10px 20px;

  background-color: #aaa;

  ul {
    display: flex;
    gap: 40px;

    li {
      cursor: pointer;
    }
  }
`;
const PostsContainer = styled.div`

`;

function SubPage({ loggedIn, currentUser, subList, followSub, unfollowSub, deleteSub, favoritePost, unfavoritePost, adjustPostVotes }) {
  const params = useParams();

  const [sub, setSub] = useState({});
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const currentSub = Object.values(subList).filter((sub) => {
      return sub.name === params.subName;
    })[0];

    setSub(currentSub);
    setPosts(Object.values(currentSub.posts));
  }, [params.subName, subList, sub.posts]);

  const deleteSubHandler = () => {
    // display popup confirmation
    if (sub.owner.uid === currentUser.uid) deleteSub(sub.name);
  }

  const sortPosts = (e) => {
    const postsCopy = [...posts];

    if (e.target.textContent === 'Top') {
      postsCopy.sort((a, b) => b.votes - a.votes);
    }

    if (e.target.textContent === 'New') {
      postsCopy.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
    }

    setPosts(postsCopy);
  }

  const getPostPreview = () => {
    return Object.values(posts).map((post) => {
      const path = `${post.uid}/${post.title.split(' ').join('_').toLowerCase()}`;
      return (
        <Link to={path} key={post.uid}>
          <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={post} favoritePost={favoritePost} unfavoritePost={unfavoritePost} adjustPostVotes={adjustPostVotes} />
        </Link>
      )
    });
  }

  return (
    <div>
      <Navbar subList={subList} />

      <Wrapper>
        {
          Object.values(sub).length > 0 ?
          <>
            <Header>
              <div>
                {/* <img src="" alt="sub pic" /> */}
                <p>{sub.subTitle}</p>
                <p>r/{sub.name}</p>
              </div>
              {
                loggedIn &&
                <div>
                  {
                    currentUser.followedSubs.includes(sub.name) ?
                    <button onClick={() => unfollowSub(sub.name)}>Unfollow</button> :
                    <button onClick={() => followSub(sub.name)}>Follow</button>
                  }
                </div>
              }
            </Header>

            <PostsSection>
              <SortOptions>
                <ul>
                  <li onClick={(e) => sortPosts(e)}>Top</li>
                  <li onClick={(e) => sortPosts(e)}>New</li>
                </ul>
              </SortOptions>

              <PostsContainer>
                  {
                    getPostPreview()
                  }
              </PostsContainer>
            </PostsSection>

            <AboutSection loggedIn={loggedIn} currentUser={currentUser} sub={sub} deleteSub={deleteSubHandler} /> 
          </> :
          <p>Loading...</p>
        }

      </Wrapper>
    </div>
  );
};

export default SubPage;