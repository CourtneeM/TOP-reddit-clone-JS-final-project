import Post from './Post';

class Sub {
  constructor(uid, name, subTitle, owner) {
    this.uid = uid;
    this.name = name;
    this.subTitle = subTitle;
    this.owner = owner;
    this.managers = {};
    this.followers = [];
    this.about = '';
    this.creationDateTime = this.getDateTime();
    this.posts = {};
  }

  getDateTime() {
    const newDate = new Date();
    return {
      time: { seconds: newDate.getSeconds(), minutes: newDate.getMinutes(), hours: newDate.getHours() },
      date: { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() }
    }
  }

  edit(name) {
    this.name = name;
  }

  delete(subList) {
    delete subList.uid;
  }

  transferOwnership(newOwner) {
    this.owner = newOwner;
  }

  addManager(userUid, user) {
    this.managers[userUid] = user;
  }

  removeManager(userUid) {
    delete this.managers[userUid];
  }

  addPost(postUid, title, owner, type, content) {
    this.posts[postUid] = new Post(postUid, title, owner, type, content);
  }

  getTopPosts() {
    const sortedPostsArr = Object.values(this.posts).sort((postA, postB) => postB.votes - postA.votes);

    return sortedPostsArr.map((post) => ({ [post.uid]: post }));
  }

  getNewestPosts() {
    // const sortedPostsArr = Object.values(this.posts).sort((postA, postB) => postB.votes - postA.votes); sort by creationDate

    // return sortedPostsArr.map((post) => ({ [post.uid]: post }));
  }
}

export default Sub;