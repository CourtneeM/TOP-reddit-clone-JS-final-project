class Comment {
  constructor(uid, text, owner) {
    this.uid = uid;
    this.text = text;
    this.owner = owner;
    this.creationDateTime = '';
    this.votes = 0;
    this.editStatus = { edited: false, editDateTime: null };
    this.deleteStatus = { deleted: false, deleteDateTime: null };
    this.child = {};
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