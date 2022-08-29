import Comment from './Comment';

class Post {
  constructor(uid, title, owner, type, content, subName, votes) {
    this.uid =  uid;
    this.title = title;
    this.owner = owner;
    this.type = type;
    this.content = content; // either text or an image/video link
    this.creationDateTime = this.getDateTime();
    this.subName = subName;
    this.votes = votes;
    this.comments = {};
  }

  getDateTime() {
    const newDate = new Date();
    return {
      time: { seconds: newDate.getSeconds(), minutes: newDate.getMinutes(), hours: newDate.getHours() },
      date: { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() },
      fullDateTime: newDate
    }
  }

  adjustVotes(num) {
    this.votes = this.votes + num;
  }

  delete(postList) {
    delete postList.uid
  }

  addComment(commentUid, owner, text, votes) {
    this.comments[commentUid] = new Comment(commentUid, owner, text, votes);
  }
}

export default Post;