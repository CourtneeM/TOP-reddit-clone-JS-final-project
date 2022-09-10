class Comment {
  constructor(uid, postUid, subName, owner, text, parentUid=null) {
    this.uid = uid;
    this.postUid = postUid;
    this.subName = subName;
    this.owner = owner;
    this.text = text;
    this.creationDateTime = this.getDateTime();
    this.votes = 0;
    this.upvotes = [];
    this.downvotes = [];
    this.editStatus = { edited: false, editDateTime: null };
    this.deleteStatus = { deleted: false, deleteDateTime: null };
    this.children = [];
    this.parentUid = parentUid;
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

  edit(text) {
    this.text = text;
    this.editStatus = {
      edited: true,
      editDateTime: this.getDateTime(),
    }
  }

  deleteText() {
    this.text = 'Comment Deleted';

    if (this.editStatus.edited) {
      this.editStatus.edited = false;
      this.editStatus.editDateTime = null;
    }

    this.deleteStatus.deleted = true;
    this.deleteStatus.deleteDateTime = this.getDateTime();
  }

  addChild(commentUid) {
    this.children.push(commentUid);
  }
}

export default Comment;