import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import Navbar from '../Navbar';
import SubPreview from './SubPreview';
import PostPreview from './PostPreview';
import CommentPreview from './CommentPreview';

import styled from 'styled-components';

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
  flex-wrap: wrap;
  position: relative;
  padding: 20px 0;

  h1 {
    flex: 1 1 100%;
    text-align: right;
  }

  ul {
    display: flex;
    gap: 40px;
    
    li {
      cursor: pointer;
    }
  }

  .user-name-image {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-bottom: 40px;
    
    div {
      position: relative;

      img {
        margin-right: 20px;
      }
      
      .profile-img {
        width: 75px;
        height: 75px;
        border-radius: 50%;
      }

      .change-profile-image {
        display: none;
        position: absolute;
        top: 30px;
        left: 0px;
        font-size: 0.8rem;
        text-align: center;
        background: #fff;
        cursor: pointer;
      }

      &:hover {
        .change-profile-image {
          display: block;
        }
      }
    }
  }

  .new-profile-image-input {
    display: none;
    position: absolute;
    right: 0;
  }

  .selected-view {
    background-color: #ccc;
  }
`;
const Body = styled.div`
  padding: 40px 80px 20px;
  background-color: #ccc;

  h2 {
    margin-bottom: 40px;
    font-size: 2.4rem;
  }
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

function UserProfile({ loggedIn, signInOut, currentUser, userList, subList, adjustPostVotes, adjustCommentVotes, editUser, storage }) {
  const [currentSelectedData, setCurrentSelectedData] = useState({});
  const [profileImg, setProfileImg] = useState('');
  const [newProfileImg, setNewProfileImg] = useState('');
  const params = useParams();

  useEffect(() => {
    displayOverview();
  }, [subList]);

  useEffect(() => {
    const pathRef = ref(storage, currentUser.profileImage);
    let attempt = 0;

    const getImage = () => {
      getDownloadURL(pathRef).then((url) => {
        setProfileImg(url);
      }).catch((err) => {
        attempt += 1;
        if (attempt >= 5) return console.log('error retrieving image', err);

        console.log('error retrieving image, retrying...', err);
        setTimeout(() => getImage(), 2000);
      });
    }

    getImage();
  }, [storage, currentUser.profileImage]);

  const displayNewProfileImgInput = () => {
    document.querySelector('.new-profile-image-input').style.display = 'block';
  }
  const cancelNewProfileImg = () => {
    document.querySelector('.new-profile-image-input').style.display = 'none';
    setNewProfileImg('');
  }
  const saveNewProfileImg = () => {
    const deletePrevFromStorage = () => {
      const prevImgRef = ref(storage, profileImg);

      deleteObject(prevImgRef)
        .then(() => console.log('image deleted'))
        .catch((err) => console.log('error', err));
    }

    if (!(ref(storage, profileImg)._location.path_ === 'images/profiles/default-profile-image.png')) deletePrevFromStorage();

    const imageRef = ref(storage, `images/profiles/${newProfileImg.name}-${currentUser.uid}`);
    uploadBytes(imageRef, newProfileImg).then((snapshot) => console.log('Uploaded image'));

    editUser(imageRef._location.path_);
    cancelNewProfileImg();
  }
  const displaySubs = () => {
    const allSubs = [];
    
    userList[params.userUid].own.subs.forEach((subName) => {
      allSubs.push(subList[subName]);
    });

    setCurrentSelectedData({
      type: 'subs',
      data: allSubs
    });
  }
  const displayPosts = () => {
    const allPosts = [];
    Object.keys(userList[params.userUid].own.posts).forEach((subName) => {
      userList[params.userUid].own.posts[subName].forEach((postUid) => {
        if (subList[subName] && subList[subName].posts[postUid])
        allPosts.push(subList[subName].posts[postUid]);
      });
    });

    setCurrentSelectedData({
      type: 'posts',
      data: allPosts
    });
  }
  const displayComments = () => {
    const allComments = [];
    Object.keys(userList[params.userUid].own.comments).forEach((subName) => {
      Object.keys(userList[params.userUid].own.comments[subName]).forEach((postUid) => {
        userList[params.userUid].own.comments[subName][postUid].forEach((commentUid) => {
          if (subList[subName] && subList[subName].posts[postUid])
          allComments.push(subList[subName].posts[postUid].comments[commentUid]);
        });
      });
    });

    setCurrentSelectedData({
      type: 'comments',
      data: allComments
    });
  }
  const displayFollowedSubs = () => {
    const followedSubs = [];
    currentUser.followedSubs.forEach((subName) => {
      if (subList[subName]) followedSubs.push(subList[subName]);
    });

    setCurrentSelectedData({
      type: 'subs',
      data: followedSubs
    });
  }
  const displayFavoritePosts = () => {
    const favoritePosts = [];
    Object.keys(currentUser.favorite.posts).forEach((subName) => {
      currentUser.favorite.posts[subName].forEach((postUid) => {
        if (subList[subName] && subList[subName].posts[postUid]) {
          favoritePosts.push(subList[subName].posts[postUid])
        };
      });
    });

    setCurrentSelectedData({
      type: 'posts',
      data: favoritePosts
    });
  }
  const displayFavoriteComments = () => {
    const favoriteComments = [];
    Object.keys(currentUser.favorite.comments).forEach((subName) => {
      Object.keys(currentUser.favorite.comments[subName]).forEach((postUid) => {
        currentUser.favorite.comments[subName][postUid].forEach((commentUid) => {
          if (subList[subName] && subList[subName].posts[postUid] && subList[subName].posts[postUid].comments[commentUid]) {
            favoriteComments.push(subList[subName].posts[postUid].comments[commentUid]);
          }
        })
      });
    });

    setCurrentSelectedData({
      type: 'comments',
      data: favoriteComments
    });
  }
  const displayOverview = () => {
    const allContent = [];
    
    userList[params.userUid].own.subs.forEach((subName) => {
      allContent.push({
        type: 'subs',
        data: subList[subName]
      });
    });

    Object.keys(userList[params.userUid].own.posts).forEach((subName) => {
      userList[params.userUid].own.posts[subName].forEach((postUid) => {
        if (subList[subName] && subList[subName].posts[postUid])
        allContent.push({
          type: 'posts',
          data: subList[subName].posts[postUid]
        });
      });
    });

    Object.keys(userList[params.userUid].own.comments).forEach((subName) => {
      Object.keys(userList[params.userUid].own.comments[subName]).forEach((postUid) => {
        userList[params.userUid].own.comments[subName][postUid].forEach((commentUid) => {
          if (subList[subName] && subList[subName].posts[postUid] && subList[subName].posts[postUid].comments[commentUid])
          allContent.push({
            type: 'comments',
            data: subList[subName].posts[postUid].comments[commentUid]
          });
        });
      });
    });

    setCurrentSelectedData({
      type: 'all',
      data: allContent
    });
  }
  const displayUpvoted = () => {
    const upvotedContent = [];
    Object.keys(currentUser.votes.upvotes.posts).forEach((subName) => {
      currentUser.votes.upvotes.posts[subName].forEach((postUid) => {
        upvotedContent.push({
          type: 'posts',
          data: subList[subName].posts[postUid],
        });
      });
    });

    Object.keys(currentUser.votes.upvotes.comments).forEach((subName) => {
      Object.keys(currentUser.votes.upvotes.comments[subName]).forEach((postUid) => {
        const commentUid = currentUser.votes.upvotes.comments[subName][postUid];
        upvotedContent.push({
          type: 'comments',
          data: subList[subName].posts[postUid].comments[commentUid],
        });
      });
    });

    setCurrentSelectedData({
      type: 'all',
      data: upvotedContent,
    });
  }
  const displayDownvoted = () => {
    const downvotedContent = [];
    Object.keys(currentUser.votes.downvotes.posts).forEach((subName) => {
      currentUser.votes.downvotes.posts[subName].forEach((postUid) => {
        downvotedContent.push({
          type: 'posts',
          data: subList[subName].posts[postUid],
        });
      });
    });

    Object.keys(currentUser.votes.downvotes.comments).forEach((subName) => {
      Object.keys(currentUser.votes.downvotes.comments[subName]).forEach((postUid) => {
        const commentUid = currentUser.votes.downvotes.comments[subName][postUid];
        downvotedContent.push({
          type: 'comments',
          data: subList[subName].posts[postUid].comments[commentUid],
        });
      });
    });

    setCurrentSelectedData({
      type: 'all',
      data: downvotedContent,
    });
  }
  const displayDeleted = () => {
    const deletedContent = [];

    Object.keys(currentUser.deletedContent.posts).forEach((subName) => {
      currentUser.deletedContent.posts[subName].forEach((postUid) => {
        deletedContent.push({
          type: 'posts',
          data: subList[subName].posts[postUid],
        });
      });
    });

    Object.keys(currentUser.deletedContent.comments).forEach((subName) => {
      Object.keys(currentUser.deletedContent.comments[subName]).forEach((postUid) => {
        const commentUid = currentUser.deletedContent.comments[subName][postUid];
        deletedContent.push({
          type: 'comments',
          data: subList[subName].posts[postUid].comments[commentUid],
        });
      });
    });

    setCurrentSelectedData({
      type: 'all',
      data: deletedContent,
    });
  }
  const getPreview = (type, el) => {
    return type === 'subs' ?
      <Link to={`/r/${el.name}`} key={el.uid}>
        <SubPreview sub={el} />
      </Link> :
    type === 'posts' ?
      <Link to={`/r/${el.subName}/${el.uid}/${el.title.split(' ').join('_').toLowerCase()}`} key={el.uid}>
        <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={el} adjustPostVotes={adjustPostVotes} storage={storage} />
      </Link> :
      <Link to={`/r/${el.subName}/${el.postUid}/${subList[el.subName].posts[el.postUid].title.split(' ').join('_').toLowerCase()}/#${el.uid}`} key={el.uid}>
        <CommentPreview
          loggedIn={loggedIn}
          currentUser={currentUser}
          userList={userList}
          postTitle={subList[el.subName].posts[el.postUid].title}
          comments={Object.values(subList[el.subName].posts[el.postUid].comments)}
          comment={el}
          adjustCommentVotes={adjustCommentVotes}
          storage={storage}
        />
      </Link>
  }
  const changeSelectedView = (e) => {
    if (e.target.textContent === 'Overview') displayOverview();
    if (e.target.textContent === 'Subs') displaySubs();
    if (e.target.textContent === 'Posts') displayPosts();
    if (e.target.textContent === 'Comments') displayComments();
    if (e.target.textContent === 'Followed Subs') displayFollowedSubs();
    if (e.target.textContent === 'Favorite Posts') displayFavoritePosts();
    if (e.target.textContent === 'Favorite Comments') displayFavoriteComments();
    if (e.target.textContent === 'Upvoted') displayUpvoted();
    if (e.target.textContent === 'Downvoted') displayDownvoted();
    if (e.target.textContent === 'Deleted') displayDeleted();

    [...document.querySelectorAll('.views-list li')].forEach((li) => li.classList.remove('selected-view'));
    e.target.classList.add('selected-view');
  }
  const sortContent = (e) => {
    const currentSelectedDataCopy = {...currentSelectedData};

    if (e.target.textContent === 'Top') {
      if (currentSelectedDataCopy.type === 'all') {
        currentSelectedDataCopy.data.sort((a, b) => b.data.votes - a.data.votes);
      } else {
        currentSelectedDataCopy.data.sort((a, b) => b.votes - a.votes);
      }
    }

    if (e.target.textContent === 'New') {
      if (currentSelectedDataCopy.type === 'all') {
        currentSelectedDataCopy.data.sort((a, b) => b.data.creationDateTime.fullDateTime - a.data.creationDateTime.fullDateTime);
      } else {
        currentSelectedDataCopy.data.sort((a, b) => b.creationDateTime.fullDateTime - a.creationDateTime.fullDateTime);
      }
    }

    setCurrentSelectedData(currentSelectedDataCopy);
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <Wrapper>
        <Header>
          <div className='user-name-image'>
            <div>
              <img src={profileImg} alt="" className='profile-img' />
              <p className='change-profile-image' onClick={() => displayNewProfileImgInput()}>Change Image</p>
            </div>
            <h1>u/{userList[params.userUid].name}</h1>
          </div>
          <div className='new-profile-image-input'>
            <input type="file" name="" id="" onChange={(e) => setNewProfileImg(e.target.files[0])} />
            <button onClick={cancelNewProfileImg}>Cancel</button>
            <button onClick={saveNewProfileImg}>Save</button>
          </div>
          <ul className='views-list'>
            <li className='selected-view' onClick={(e) => changeSelectedView(e)}>Overview</li>
            <li onClick={(e) => changeSelectedView(e)}>Subs</li>
            <li onClick={(e) => changeSelectedView(e)}>Posts</li>
            <li onClick={(e) => changeSelectedView(e)}>Comments</li>
            { currentUser.uid === params.userUid ?
              <>
                <li onClick={(e) => changeSelectedView(e)}>Followed Subs</li>
                <li onClick={(e) => changeSelectedView(e)}>Favorite Posts</li>
                <li onClick={(e) => changeSelectedView(e)}>Favorite Comments</li>
                <li onClick={(e) => changeSelectedView(e)}>Upvoted</li>
                <li onClick={(e) => changeSelectedView(e)}>Downvoted</li>
                <li onClick={(e) => changeSelectedView(e)}>Deleted</li>
              </> :
              null
            }
          </ul>
        </Header>
        <Body>
          <SortOptions>
            <ul>
              <li onClick={(e) => sortContent(e)}>Top</li>
              <li onClick={(e) => sortContent(e)}>New</li>
            </ul>
          </SortOptions>
          {
            Object.values(currentSelectedData).length > 0 ?
            currentSelectedData.data.map((el) => {
              return currentSelectedData.type === 'all' ?
              getPreview(el.type, el.data) :
              getPreview(currentSelectedData.type, el)
            }) :
            null
          }
        </Body>
      </Wrapper>
    </div>
  );
};

export default UserProfile;