import Post from './Post';

class Sub {
  constructor(name, owner, subTitle, about, moderators=[], followers=[], creationDateTime=this.getDateTime(), posts={}) {
    this.name = name;
    this.owner = owner;
    this.subTitle = subTitle;
    this.about = about;
    this.moderators = moderators;
    this.followers = followers;
    this.creationDateTime = creationDateTime;
    this.posts = posts;
  }

  getDateTime() {
    const newDate = new Date();
    return {
      time: { seconds: newDate.getSeconds(), minutes: newDate.getMinutes(), hours: newDate.getHours() },
      date: { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() }
    }
  }

  delete(subList) {
    delete subList.uid;
  }

  transferOwnership(newOwner) {
    this.owner = newOwner;
  }

  addModerator(userUid, user) {
    this.moderators[userUid] = user;
  }

  removeModerator(userUid) {
    delete this.moderators[userUid];
  }

  addPost(postUid, title, owner, type, content, subName, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, comments) {
    this.posts[postUid] = new Post(postUid, title, owner, type, content, subName, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, comments);
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