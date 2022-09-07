class User {
  constructor(uid, name, email) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.joinDate = this.getDateTime();
    this.own = {
      subs: [],
      posts: {},
      comments: {},
    }
    this.favorite = {
      posts: {},
      comments: {},
    }
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
      fullDateTime: newDate
    }
  }
}

export default User;