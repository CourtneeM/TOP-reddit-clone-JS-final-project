class User {
  constructor(uid, name, email, profileImage) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.profileImage = profileImage;
    this.joinDate = this.getDateTime();
    this.own = {
      subs: [],
      posts: {},
      comments: {},
    };
    this.deletedContent = {
      posts: {},
      comments: {},
    }
    this.moderator = [];
    this.favorite = {
      posts: {},
      comments: {},
    };
    this.votes = {
      upvotes: {
        posts: {},
        comments: {}
      },
      downvotes: {
        posts: {},
        comments: {}
      }
    }
    this.followedSubs = [];
  }

  getDateTime() {
    const newDate = new Date();
    return {
      time: { seconds: newDate.getSeconds(), minutes: newDate.getMinutes(), hours: newDate.getHours() },
      date: { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() },
      // fullDateTime: newDate
    }
  }
}

export default User;