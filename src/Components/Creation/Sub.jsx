class Sub {
  constructor(uid, name, owner) {
    this.uid = uid;
    this.name = name;
    this.owner = owner;
    this.managers = {};
    this.posts = {};
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

  addPost(postUid, post) {
    this.posts[postUid] = post;
  }
}

export default Sub;