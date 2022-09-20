import Comment from './Comment';

class Post {
  constructor(uid, title, owner, type, content, subName, creationDateTime=this.getDateTime(), favoritedBy=[], votes=0, upvotes=[], downvotes=[],
              editStatus=this.editStatus(), deleteStatus=this.deleteStatus(), comments={}) {
    this.uid =  uid;
    this.title = title;
    this.owner = owner;
    this.type = type;
    this.content = content;
    this.subName = subName;
    this.creationDateTime = creationDateTime;
    this.favoritedBy = favoritedBy;
    this.votes = votes;
    this.upvotes = upvotes;
    this.downvotes = downvotes;
    this.editStatus = editStatus;
    this.deleteStatus = deleteStatus;
    this.comments = comments;
  }
  
  editStatus() { return { edited: false, editDateTime: null } };
  deleteStatus() { return { deleted: false, deleteDateTime: null } };

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

  edit(content) {
    this.content = content;
    this.editStatus = {
      edited: true,
      editDateTime: this.getDateTime(),
    }
  }

  deleteText() {
    this.content = 'Post Deleted';

    if (this.editStatus.edited) {
      this.editStatus.edited = false;
      this.editStatus.editDateTime = null;
    }

    this.deleteStatus.deleted = true;
    this.deleteStatus.deleteDateTime = this.getDateTime();
  }

  delete(postList) {
    delete postList.uid
  }

  addComment(commentUid, postUid, subName, owner, text, parentUid, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, children) {
    this.comments[commentUid] = new Comment(commentUid, postUid, subName, owner, text, parentUid, creationDateTime, favoritedBy, votes, upvotes, downvotes, editStatus, deleteStatus, children);
  }
}

export default Post;