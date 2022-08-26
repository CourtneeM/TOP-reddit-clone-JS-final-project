import Comment from './Comment';

class Post {
  constructor(uid, title, owner, type, content) {
    this.uid =  uid;
    this.title = title;
    this.owner = owner;
    this.type = type;
    this.content = content; // either text or an image/video link
    this.creationDateTime = this.getDateTime();
    this.votes = 0;
    this.comments = {};
  }

  getDateTime() {
    const newDate = new Date();
    return {
      time: { seconds: newDate.getSeconds(), minutes: newDate.getMinutes(), hours: newDate.getHours() },
      date: { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() }
    }
  }

  adjustVotes(num) {
    this.votes = this.votes + num;
  }

  delete(postList) {
    delete postList.uid
  }

  addComment(commentUid, owner, text) {
    this.comments[commentUid] = new Comment(commentUid, owner, text);
  }
}

export default Post;