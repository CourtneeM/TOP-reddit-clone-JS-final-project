class Comment {
  constructor(uid, postUid, subName, owner, text, parentUid=null, creationDateTime=this.getDateTime(), favoritedBy=[], votes=0, upvotes=[], downvotes=[],
              editStatus=this.editStatus(), deleteStatus=this.deleteStatus(), children=[]) {
    this.uid = uid;
    this.postUid = postUid;
    this.subName = subName;
    this.owner = owner;
    this.text = text;
    this.parentUid = parentUid;
    this.creationDateTime = creationDateTime;
    this.favoritedBy = favoritedBy;
    this.votes = votes;
    this.upvotes = upvotes;
    this.downvotes = downvotes;
    this.editStatus = editStatus;
    this.deleteStatus = deleteStatus;
    this.children = children;
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