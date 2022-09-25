import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { deleteObject, getDownloadURL, ref, updateMetadata } from 'firebase/storage';

import Navbar from '../Navbar';
import SubPreview from './SubPreview';
import PostPreview from '../PostPreview';
import Comment from '../Comment';

import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;

  a { color: #000; }

  .hidden {
    display: none;
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;

  .user-name-image {
    flex: 1 1 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    div {
      position: relative;

      h2 { font-size: 1.75rem; }

      img {
        margin-right: 30px;
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
`;
const ViewsList = styled.ul`
  display: flex;
  margin-bottom: -22px;
    
  li {
    padding: 8px 20px 30px;
    border-radius: 15px 15px 0 0;
    cursor: pointer;
  }

  .selected-view {
    background-color: #ccc;
  }
`;
const Body = styled.div`
  padding: 40px 80px 20px;
  background-color: #ccc;
  border-radius: 8px;

  h2 {
    margin-bottom: 40px;
    font-size: 2.4rem;
  }
`;
const SortOptions = styled.div`
  margin-bottom: 20px;
  border-bottom: 3px solid #fff;

  ul {
    display: flex;
    gap: 25px;

    li {
      padding: 0 4px 9px;
      cursor: pointer;
    }
  }

  .selected-sort {
    margin-bottom: -3px;
    border-bottom: 3px solid cyan;
  }
`;

function UserProfile({ loggedIn, signInOut, currentUser, userList, subList, adjustPostVotes, adjustCommentVotes, editUser, uploadImage, storage }) {
  const [currentSelectedData, setCurrentSelectedData] = useState({});
  const [profileImg, setProfileImg] = useState('');
  const [newProfileImg, setNewProfileImg] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    if (Object.values(subList).length === 0) return;

    displayOverview();
  }, [subList]);
  useEffect(() => {
    if (Object.values(userList).length === 0 || currentUser === undefined || params.userUid === undefined) return;
    
    const pathRef = ref(storage, userList[params.userUid].profileImage);
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
  }, [userList, currentUser, params.userUid, storage]);
  useEffect(() => {
    if (Object.values(subList).length === 0 || Object.values(userList).length === 0) return;

    setLoading(false);
  }, [subList, userList]);

  const displayNewProfileImgInput = () => {
    document.querySelector('.new-profile-image-input').style.display = 'block';
  }
  const cancelNewProfileImg = () => {
    document.querySelector('.new-profile-image-input').style.display = 'none';
    setNewProfileImg('');
  }
  const saveNewProfileImg = async () => {
    const isFileTooLarge = (fileSize) => fileSize > (5 * 1024 * 1024);
    const deletePrevFromStorage = () => {
      const prevImgRef = ref(storage, profileImg);

      deleteObject(prevImgRef)
        .then(() => console.log('prev profile image deleted'))
        .catch((err) => console.log('error', err));
    }

    if (isFileTooLarge(newProfileImg.size)) return displayInputError('too large');
    if (newProfileImg['type'].split('/')[0] !== 'image' ) return displayInputError('not image');

    const imageRef = ref(storage, `images/profiles/${newProfileImg.name}-${currentUser.uid}`);
    await uploadImage(imageRef, newProfileImg);
    
    getDownloadURL(imageRef).then((url) => {
      editUser(imageRef._location.path_);
      cancelNewProfileImg();

      updateMetadata(imageRef, { customMetadata: { owner: currentUser.uid } });
      if (!(ref(storage, profileImg)._location.path_ === 'images/profiles/default-profile-image.png')) deletePrevFromStorage();
    }).catch((err) => {
      if (newProfileImg['type'].split('/')[0] !== 'image') {
        displayInputError('not image');
        console.log('Error: File is not image', err);
      } else {
        displayInputError('too large');
        console.log('Error: Image too large', err);
      }
    });
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
  const displayFollowed = () => {
    const followedSubs = [];
    currentUser.followedSubs.forEach((subName) => {
      if (subList[subName]) followedSubs.push(subList[subName]);
    });

    setCurrentSelectedData({
      type: 'subs',
      data: followedSubs
    });
  }
  const displayFavorites = () => {
    const favorites = []
    const getFavoritePosts = () => {
      Object.keys(currentUser.favorite.posts).forEach((subName) => {
        currentUser.favorite.posts[subName].forEach((postUid) => {
          if (subList[subName] && subList[subName].posts[postUid]) {
            favorites.push({
              type: 'posts',
              data: subList[subName].posts[postUid],
            });
          };
        });
      });
    }
    const getFavoriteComments = () => {
      Object.keys(currentUser.favorite.comments).forEach((subName) => {
        Object.keys(currentUser.favorite.comments[subName]).forEach((postUid) => {
          currentUser.favorite.comments[subName][postUid].forEach((commentUid) => {
            if (subList[subName] && subList[subName].posts[postUid] && subList[subName].posts[postUid].comments[commentUid]) {
              favorites.push({
                type: 'comments',
                data: subList[subName].posts[postUid].comments[commentUid],
              });
            }
          })
        });
      });
    }

    getFavoritePosts();
    getFavoriteComments();

    setCurrentSelectedData({
      type: 'all',
      data: favorites
    });
  }
  const displayOverview = () => {
    const allContent = [];

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
      if (subList[subName] === undefined) return;
      currentUser.deletedContent.posts[subName].forEach((postUid) => {
        deletedContent.push({
          type: 'posts',
          data: subList[subName].posts[postUid],
        });
      });
    });

    Object.keys(currentUser.deletedContent.comments).forEach((subName) => {
      if (!subList[subName]) return;

      Object.keys(currentUser.deletedContent.comments[subName]).forEach((postUid) => {
        const commentUid = currentUser.deletedContent.comments[subName][postUid];
        deletedContent.push({
          type: 'comments',
          data: subList[subName] ? subList[subName].posts[postUid].comments[commentUid] : null,
        });
      });
    });


    setCurrentSelectedData({
      type: 'all',
      data: deletedContent,
    });
  }
  const displayInputError = (reason) => {
    const errorMsg = document.querySelector(`.error-msg`);

    if (reason === 'too large') errorMsg.textContent = 'Error: File size too large. Max 5MB';
    if (reason === 'not image') errorMsg.textContent = 'Error: File must be an image';

    setTimeout(() => {
      errorMsg.classList.add('hidden');
    }, 5000);
    errorMsg.classList.remove('hidden');
  }
  const getPreview = (type, el) => {
    return type === 'subs' ?
      <Link to={`/r/${el.name}`} key={el.uid} className='default-link'>
        <SubPreview sub={el} />
      </Link> :
    type === 'posts' ?
      <Link to={`/r/${el.subName}/${el.uid}/${el.title.split(' ').join('_').toLowerCase()}`} key={el.uid} className='default-link'>
        <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={el} adjustPostVotes={adjustPostVotes} storage={storage} />
      </Link> :
      <Link to={`/r/${el.subName}/${el.postUid}/${subList[el.subName].posts[el.postUid].title.split(' ').join('_').toLowerCase()}/#${el.uid}`} key={el.uid} className='default-link'>
        <Comment
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
    if (e.target.textContent === 'Followed') displayFollowed();
    if (e.target.textContent === 'Favorites') displayFavorites();
    if (e.target.textContent === 'Upvoted') displayUpvoted();
    if (e.target.textContent === 'Downvoted') displayDownvoted();
    // if (e.target.textContent === 'Deleted') displayDeleted();

    if (e.target.textContent === 'Subs' || e.target.textContent === 'Followed')  {
      document.querySelector('.sort-options').style.display = 'none';
    } else {
      document.querySelector('.sort-options').style.display = 'block';
    }

    [...document.querySelectorAll('.views-list li')].forEach((li) => li.classList.remove('selected-view'));
    e.target.classList.add('selected-view');
  }
  const sortContent = (e) => {
    const currentSelectedDataCopy = {...currentSelectedData};
    if (document.querySelector('.selected-sort')) document.querySelector('.selected-sort').classList.remove('selected-sort');
    e.target.classList.add('selected-sort');

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
        {
          loading ?
          <p>Loading...</p> :
          <>
            <Header>
              <div className='user-name-image'>
                <div>
                  <img src={profileImg} alt="" className='profile-img' />
                  <p className='change-profile-image' onClick={() => displayNewProfileImgInput()}>Change Image</p>
                  <p className='error-msg hidden'></p>
                </div>
                <h2>u/{userList[params.userUid].name}</h2>
              </div>
              <div className='new-profile-image-input'>
                <input type="file" name="" id="" onChange={(e) => setNewProfileImg(e.target.files[0])} />
                <button onClick={cancelNewProfileImg}>Cancel</button>
                <button onClick={saveNewProfileImg}>Save</button>
              </div>
              <ViewsList className='views-list'>
                <li className='selected-view' onClick={(e) => changeSelectedView(e)}>Overview</li>
                <li onClick={(e) => changeSelectedView(e)}>Subs</li>
                <li onClick={(e) => changeSelectedView(e)}>Posts</li>
                <li onClick={(e) => changeSelectedView(e)}>Comments</li>
                { currentUser.uid === params.userUid ?
                  <>
                    <li onClick={(e) => changeSelectedView(e)}>Followed</li>
                    <li onClick={(e) => changeSelectedView(e)}>Favorites</li>
                    <li onClick={(e) => changeSelectedView(e)}>Upvoted</li>
                    <li onClick={(e) => changeSelectedView(e)}>Downvoted</li>
                    {/* <li onClick={(e) => changeSelectedView(e)}>Deleted</li> */}
                  </> :
                  null
                }
              </ViewsList>
            </Header>
            <Body>
              <SortOptions className='sort-options'>
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
          </>
        }
      </Wrapper>
    </div>
  );
};

export default UserProfile;