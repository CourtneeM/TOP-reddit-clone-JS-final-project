import { createContext, useContext } from "react";

import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getFirebaseConfig } from '../../firebase-config';

import uniqid from 'uniqid';

import { UserContext } from "./UserContext";
import { SubContext } from "./SubContext";

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

const CommentContext = createContext();

const CommentProvider = ({ children }) => {
  const { userList, setUserList, currentUser, setCurrentUser } = useContext(UserContext);
  const { subList, setSubList } = useContext(SubContext);

  const addComment = (commentText, postUid, subName, parentComment=null) => {
    const owner = {uid: currentUser.uid, name: currentUser.name};
    let subListCopy = {...subList};
    const commentUid = uniqid();
    
    if (parentComment) {
      subListCopy[subName].posts[postUid].addComment(commentUid, postUid, subName, owner, commentText, parentComment.uid);
      parentComment.addChild(commentUid);
      } else {
      subListCopy[subName].posts[postUid].addComment(commentUid, postUid, subName, owner, commentText);
    }

    setSubList(subListCopy);

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].own.comments[subName]) userListCopy[currentUser.uid].own.comments[subName] = {};
    if (!userListCopy[currentUser.uid].own.comments[subName][postUid]) userListCopy[currentUser.uid].own.comments[subName][postUid] = [];

    userListCopy[currentUser.uid].own.comments[subName][postUid].push(commentUid);

    setUserList(userListCopy);

    const addCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        const post = {...subListCopy[subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
      });
    }

    addCommentInFirestore();
  }

  const editComment = (editedComment) => {
    const subListCopy = {...subList};
    subListCopy[editedComment.subName].posts[editedComment.postUid].comments[editedComment.uid].edit(editedComment.text);

    setSubList(subListCopy);

    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[editedComment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[editedComment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', editedComment.subName), {
        posts: allSubPosts,
      });
    }

    editCommentInFirestore();
  }

  const deleteComment = (comment) => {
    const deleteCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[comment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[comment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', comment.subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        own: userListCopy[currentUser.uid].own,
      });
    }
    const editUsersInFirestore = () => {
      editedUsers.forEach(async (userUid) => {
        await updateDoc(doc(db, 'users', userUid), {
          favorite: userListCopy[userUid].favorite,
        });
      })
    }
    const removeFavoritesFromUser = () => {
      comment.favoritedBy.forEach((userUid) => {
        const index = userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].indexOf(comment.uid);
        userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].splice(index, 1);
        
        if (userListCopy[userUid].favorite.comments[comment.subName][comment.postUid].length === 0) {
          delete userListCopy[userUid].favorite.comments[comment.subName][comment.postUid];
        }
        if (Object.values(userListCopy[userUid].favorite.comments[comment.subName]).length === 0) {
          delete userListCopy[userUid].favorite.comments[comment.subName];
        }

        editedUsers.push(userUid);
      });
    }

    const subListCopy = {...subList};
    const userListCopy = {...userList};
    const commentPath = subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid];
    const commentOwnerUid = commentPath.owner.uid;
    const index = userListCopy[commentOwnerUid].own.comments[comment.subName][comment.postUid].indexOf(comment.uid);

    const deletedComment = userListCopy[commentOwnerUid].own.comments[comment.subName][comment.postUid].splice(index, 1)[0];
    if (!userListCopy[commentOwnerUid].deletedContent.comments[comment.subName]) {
      userListCopy[commentOwnerUid].deletedContent.comments[comment.subName] = {};
    }
    if (!userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid]) {
      userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid] = [];
    }
    userListCopy[commentOwnerUid].deletedContent.comments[comment.subName][comment.postUid].push(deletedComment);

    setUserList(userListCopy);

    commentPath.deleteText();
    setSubList(subListCopy);
    
    const editedUsers = [];
    removeFavoritesFromUser();
    editUsersInFirestore();

    deleteCommentInFirestore();
  }

  const adjustCommentVotes = (num, comment, currentUserCopy) => {
    const subListCopy = {...subList};
    subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid] = comment;
    subListCopy[comment.subName].posts[comment.postUid].comments[comment.uid].adjustVotes(num);
    setSubList(subListCopy);

    const userListCopy = {...userList};
    userListCopy[currentUser.uid] = currentUserCopy;
    setUserList(userListCopy);

    setCurrentUser(currentUserCopy);

    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[comment.subName].posts).forEach((postUid) => {
        const post = {...subListCopy[comment.subName].posts[postUid]};
        const comments = {};
        Object.keys(post.comments).forEach((commentUid) => comments[commentUid] = {...post.comments[commentUid]});
        post.comments = comments;
        allSubPosts[postUid] = post;
      });

      await updateDoc(doc(db, 'subs', comment.subName), {
        posts: allSubPosts,
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        votes: userListCopy[currentUser.uid].votes,
      });
    }

    editCommentInFirestore();
  }

  const favoriteComment = (subName, postUid, commentUid) => {
    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};

        const post = allSubPosts[postUid];
        const existingComments = post.comments;
        delete post.comments;
        post.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          post.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = post;
      });
      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        favorite: userListCopy[currentUser.uid].favorite,
      });
    }

    const userListCopy = {...userList};
    if (!userListCopy[currentUser.uid].favorite.comments[subName]) userListCopy[currentUser.uid].favorite.comments[subName] = {};
    if (!userListCopy[currentUser.uid].favorite.comments[subName][postUid]) userListCopy[currentUser.uid].favorite.comments[subName][postUid] = [];
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].push(commentUid);

    setUserList(userListCopy);

    const subListCopy = {...subList};
    subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.push(currentUser.uid);

    editCommentInFirestore();
  }

  const unfavoriteComment = (subName, postUid, commentUid) => {
    const editCommentInFirestore = async () => {
      const allSubPosts = {};
      Object.keys(subListCopy[subName].posts).forEach((postUid) => {
        allSubPosts[postUid] = {...subListCopy[subName].posts[postUid]};

        const post = allSubPosts[postUid];
        const existingComments = post.comments;
        delete post.comments;
        post.comments = {};

        Object.keys(existingComments).forEach((commentUid) => {
          post.comments[commentUid] = {...existingComments[commentUid]};
        });

        allSubPosts[postUid] = post;
      });
      await updateDoc(doc(db, 'subs', subName), {
        posts: allSubPosts
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        favorite: userListCopy[currentUser.uid].favorite,
      });
    }

    const userListCopy = {...userList};
    const index = userListCopy[currentUser.uid].favorite.comments[subName][postUid].indexOf(commentUid);
    userListCopy[currentUser.uid].favorite.comments[subName][postUid].splice(index, 1);

    if (userListCopy[currentUser.uid].favorite.comments[subName][postUid].length === 0) {
      delete userListCopy[currentUser.uid].favorite.comments[subName][postUid];
    }
    if (Object.values(userListCopy[currentUser.uid].favorite.comments[subName]).length === 0) {
      delete userListCopy[currentUser.uid].favorite.comments[subName];
    }

    setUserList(userListCopy);

    const subListCopy = {...subList};
    const userUidIndex = subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.indexOf(currentUser.uid);
    subListCopy[subName].posts[postUid].comments[commentUid].favoritedBy.splice(userUidIndex, 1);

    editCommentInFirestore();
  }

  return (
    <CommentContext.Provider value={{ addComment, editComment, deleteComment, adjustCommentVotes, favoriteComment, unfavoriteComment }}>
      {children}
    </CommentContext.Provider>
  );
}

export { CommentContext, CommentProvider };