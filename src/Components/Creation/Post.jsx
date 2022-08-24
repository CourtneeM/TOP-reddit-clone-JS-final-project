class Post {
  constructor(uid, title, type, owner) {
    this.uid =  uid;
    this.title = title;
    this.owner = owner;
    this.type = type;
    this.content = ''; // either text or an image/video link
    this.creationDate = '';
    this.comments = {};
  }

  delete(postList) {
    delete postList.uid
  }

  addComment(commentUid, comment) {
    this.comments[commentUid] = comment;
  }
}

export default Post;