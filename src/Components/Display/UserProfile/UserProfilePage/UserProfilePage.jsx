import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { deleteObject, getDownloadURL, ref, updateMetadata } from 'firebase/storage';

import Navbar from '../../Navbar/Navbar';
import SubPreview from '../SubPreview/SubPreview';
import PostPreview from '../../PostPreview/PostPreview';
import CommentPreview from '../CommentPreview/CommentPreview';

import styles from './UserProfilePage.module.css';

function UserProfile({ loggedIn, signInOut, currentUser, userList, subList, postActions, commentActions, editUser, uploadImage, storage }) {
  const [currentSelectedData, setCurrentSelectedData] = useState({});
  const [profileImg, setProfileImg] = useState('');
  const [newProfileImg, setNewProfileImg] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    if (Object.values(subList).length === 0) return;

    actions.getOverview();
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

  const actions = (() => {
    const cancelNewProfileImg = () => {
      display.hideNewProfileImageInput();
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
  
      if (isFileTooLarge(newProfileImg.size)) return display.inputError('too large');
      if (newProfileImg['type'].split('/')[0] !== 'image' ) return display.inputError('not image');
  
      const imageRef = ref(storage, `images/profiles/${newProfileImg.name}-${currentUser.uid}`);
      await uploadImage(imageRef, newProfileImg);
      
      getDownloadURL(imageRef).then((url) => {
        editUser(imageRef._location.path_);
        actions.cancelNewProfileImg();
  
        updateMetadata(imageRef, { customMetadata: { owner: currentUser.uid } });
        if (!(ref(storage, profileImg)._location.path_ === 'images/profiles/default-profile-image.png')) deletePrevFromStorage();
      }).catch((err) => {
        if (newProfileImg['type'].split('/')[0] !== 'image') {
          display.inputError('not image');
          console.log('Error: File is not image', err);
        } else {
          display.inputError('too large');
          console.log('Error: Image too large', err);
        }
      });
    }

    const getSubs = () => {
      const allSubs = [];
      
      userList[params.userUid].own.subs.forEach((subName) => {
        allSubs.push(subList[subName]);
      });
  
      setCurrentSelectedData({
        type: 'subs',
        data: allSubs
      });
    }
    const getPosts = () => {
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
    const getComments = () => {
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
    const getFollowed = () => {
      const followedSubs = [];
      currentUser.followedSubs.forEach((subName) => {
        if (subList[subName]) followedSubs.push(subList[subName]);
      });
  
      setCurrentSelectedData({
        type: 'subs',
        data: followedSubs
      });
    }
    const getFavorites = () => {
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
    const getOverview = () => {
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
    const getUpvoted = () => {
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
    const getDownvoted = () => {
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
    const getDeleted = () => {
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

    const sortContent = (e) => {
      const currentSelectedDataCopy = {...currentSelectedData};
      if (document.querySelector('.selected-sort')) document.querySelector('.selected-sort').classList.remove('selected-sort', styles.selectedSort);
      e.target.classList.add('selected-sort', styles.selectedSort);
  
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

    return { cancelNewProfileImg, saveNewProfileImg, getSubs, getPosts, getComments, getFollowed, getFavorites,
             getOverview, getUpvoted, getDownvoted, getDeleted, sortContent }
  })();
  const display = (() => {
    const header = () => {
      const userInfo = () => {
        return (
          <>
            <div>
              <img src={profileImg} alt="" className={styles.profileImg} />
              <p className={styles.changeProfileImage} onClick={() => display.newProfileImgInput()}>Change Image</p>
              <p className={`error-msg ${styles.hidden}`}></p>
            </div>
            <h2>u/{userList[params.userUid].name}</h2>
          </>
        );
      }
      const viewsList = () => {
        return (
          <>
            <li className={`selected-view ${styles.selectedView}`} onClick={(e) => display.changeSelectedView(e)}>Overview</li>
            <li onClick={(e) => display.changeSelectedView(e)}>Subs</li>
            <li onClick={(e) => display.changeSelectedView(e)}>Posts</li>
            <li onClick={(e) => display.changeSelectedView(e)}>Comments</li>
            { currentUser.uid === params.userUid ?
              <>
                <li onClick={(e) => display.changeSelectedView(e)}>Followed</li>
                <li onClick={(e) => display.changeSelectedView(e)}>Favorites</li>
                <li onClick={(e) => display.changeSelectedView(e)}>Upvoted</li>
                <li onClick={(e) => display.changeSelectedView(e)}>Downvoted</li>
                {/* <li onClick={(e) => display.changeSelectedView(e)}>Deleted</li> */}
              </> :
              null
            }
          </>
        );
      }

      return (
        <>
          <div className={styles.userNameImage}>
            { userInfo() }
          </div>
          <div className={`new-profile-image-input ${styles.newProfileImageInput}`}>
            <input type="file" name="" id="" onChange={(e) => setNewProfileImg(e.target.files[0])} />
            <button onClick={actions.cancelNewProfileImg}>Cancel</button>
            <button onClick={actions.saveNewProfileImg}>Save</button>
          </div>

          <div className={`views-list ${styles.viewsList}`}>
            { viewsList() }
          </div>
        </>
      );
    }

    const newProfileImgInput = () => {
      document.querySelector('.new-profile-image-input').style.display = 'block';
    }
    const selectedViewPreview = (type, el) => {
      return type === 'subs' ?
        <Link to={`/r/${el.name}`} key={el.uid} className='default-link'>
          <SubPreview sub={el} />
        </Link> :
      type === 'posts' ?
        <PostPreview loggedIn={loggedIn} currentUser={currentUser} post={el} postActions={postActions} storage={storage} /> :
        <CommentPreview
          loggedIn={loggedIn}
          currentUser={currentUser}
          userList={userList}
          subList={subList}
          comments={Object.values(subList[el.subName].posts[el.postUid].comments)}
          comment={el}
          commentActions={commentActions}
          storage={storage}
        />
    }
    const changeSelectedView = (e) => {
      if (e.target.textContent === 'Overview') actions.getOverview();
      if (e.target.textContent === 'Subs') actions.getSubs(); 
      if (e.target.textContent === 'Posts') actions.getPosts();
      if (e.target.textContent === 'Comments') actions.getComments();
      if (e.target.textContent === 'Followed') actions.getFollowed();
      if (e.target.textContent === 'Favorites') actions.getFavorites();
      if (e.target.textContent === 'Upvoted') actions.getUpvoted();
      if (e.target.textContent === 'Downvoted') actions.getDownvoted();
      // if (e.target.textContent === 'Deleted') actions.getDeleted();
  
      if (e.target.textContent === 'Subs' || e.target.textContent === 'Followed')  {
        document.querySelector('.sort-options').style.display = 'none';
      } else {
        document.querySelector('.sort-options').style.display = 'block';
      }
  
      [...document.querySelectorAll('.views-list li')].forEach((li) => li.classList.remove('selected-view', styles.selectedView));
      e.target.classList.add('selected-view', styles.selectedView);
    }

    const hideNewProfileImageInput = () => {
      document.querySelector('.new-profile-image-input').style.display = 'none';
    }
    const inputError = (reason) => {
      const errorMsg = document.querySelector(`.error-msg`);
  
      if (reason === 'too large') errorMsg.textContent = 'Error: File size too large. Max 5MB';
      if (reason === 'not image') errorMsg.textContent = 'Error: File must be an image';
  
      setTimeout(() => {
        errorMsg.classList.add('hidden');
      }, 5000);
      errorMsg.classList.remove('hidden');
    }

    return { header, newProfileImgInput, selectedViewPreview, changeSelectedView, hideNewProfileImageInput, inputError }
  })();

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <div className={styles.wrapper}>
        {
          loading ?
          <p>Loading...</p> :
          <>
            <header>
              { display.header() }
            </header>
            <body>
              <div className={`sort-options ${styles.sortOptions}`}>
                <ul>
                  <li onClick={(e) => actions.sortContent(e)}>Top</li>
                  <li onClick={(e) => actions.sortContent(e)}>New</li>
                </ul>
              </div>
              {
                Object.values(currentSelectedData).length > 0 ?
                currentSelectedData.data.map((el) => {
                  return currentSelectedData.type === 'all' ?
                  display.selectedViewPreview(el.type, el.data) :
                  display.selectedViewPreview(currentSelectedData.type, el)
                }) :
                null
              }
            </body>
          </>
        }
      </div>
    </div>
  );
};

export default UserProfile;