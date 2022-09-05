import { useParams } from 'react-router-dom';

import Navbar from './Navbar';

import styled from 'styled-components';
import { useState } from 'react';

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 20px 0;

  ul {
    display: flex;
    gap: 40px;
    
    li {
      cursor: pointer;
    }
  }

  h1 {
    margin-left: auto;
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

function UserProfile({ loggedIn, currentUser, userList, subList }) {
  const [currentSelectedData, setCurrentSelectedData] = useState([]);
  const params = useParams();

  const displayPosts = () => {
    setCurrentSelectedData(Object.keys(userList[params.userUid].own.posts).map((subName) => {
      return userList[params.userUid].own.posts[subName].map((postUid) => {
        return subList[subName].posts[postUid]
      });
    }));
  }
  const displayComments = () => {
    setCurrentSelectedData(Object.keys(userList[params.userUid].own.comments).map((subName) => {
      return Object.keys(userList[params.userUid].own.comments[subName]).map((postUid) => {
        return subList[subName].posts[postUid].comments[userList[params.userUid].own.comments[subName][postUid]];
      });
    }));
  }
  const displayFavoritePosts = () => {
    setCurrentSelectedData(Object.keys(currentUser.favorite.posts).map((subName) => {
      return currentUser.favorite.posts[subName].map((postUid) => {
        return subList[subName].posts[postUid]
      });
    }));
  }
  const displayFavoriteComments = () => {
    setCurrentSelectedData(Object.keys(currentUser.favorite.comments).map((subName) => {
      return Object.keys(currentUser.favorite.comments[subName]).map((postUid) => {
        return subList[subName].posts[postUid].comments[currentUser.favorite.comments[subName][postUid]];
      });
    }));
  }

  const changeSelectedView = (e) => {
    if (e.target.textContent === 'Posts') displayPosts();
    if (e.target.textContent === 'Comments') displayComments();
    if (e.target.textContent === 'Favorite Posts') displayFavoritePosts();
    if (e.target.textContent === 'Favorite Comments') displayFavoriteComments();
  }

  return (
    <div>
      <Navbar currentUser={currentUser} subList={subList} />

      <Wrapper>
        <Header>
          <ul>
            <li onClick={(e) => changeSelectedView(e)}>Overview</li>
            <li onClick={(e) => changeSelectedView(e)}>Posts</li>
            <li onClick={(e) => changeSelectedView(e)}>Comments</li>
            <li onClick={(e) => changeSelectedView(e)}>Favorite Posts</li>
            <li onClick={(e) => changeSelectedView(e)}>Favorite Comments</li>
          </ul>
          <h1>u/{userList[params.userUid].name}</h1>
        </Header>
        <Body>
          {
            currentSelectedData.map((el) => {
              
            })
          }
        </Body>
      </Wrapper>
    </div>
  );
};

export default UserProfile;