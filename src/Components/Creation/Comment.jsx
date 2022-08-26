class Comment {
  constructor(uid, owner, text) {
    this.uid = uid;
    this.owner = owner;
    this.text = text;
    this.creationDateTime = this.getDateTime();
    this.votes = 0;
    this.editStatus = { edited: false, editDateTime: null };
    this.deleteStatus = { deleted: false, deleteDateTime: null };
    this.child = {};
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

  edit(text) {
    this.text = text;
    this.editStatus = {
      edited: true,
      editDateTime: 'current date/time',
    }
  }

  deleteText() {
    this.text = 'Comment Deleted';
    this.owner = 'Deleted';

    if (this.editStatus.edited) {
      this.editStatus.edited = false;
      this.editStatus.editDateTime = null;
    }

    this.deleteStatus.deleted = true;
    this.deleteStatus.deleteDateTime = 'current date/time';
  }

  addChild(uid) {
    this.child = uid;
  }
}

export default Comment;