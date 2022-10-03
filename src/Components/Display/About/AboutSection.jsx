import { useNavigate, Link } from 'react-router-dom';

import styles from './AboutSection.module.css';

function AboutSection({ loggedIn, currentUser, userList, sub }) {
  const navigate = useNavigate();

  const editSubHandler = () => {
    navigate(`/r/${sub.name}/edit_sub`);
  }

  return (
    <div className={styles.about}>
      <header>
        <h3>About</h3>
        <p>{sub.about}</p>
        <p>Created {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
        <p>Owner:
          <Link to={`/u/${sub.owner.uid}/${sub.owner.name}`} className='default-link'>
            u/{sub.owner.name}
          </Link>
        </p>
        <p>{sub.followers.length ? sub.followers.length : 0} <span>Followers</span></p>
      </header>

      <div className={styles.subOptions}>
        {
          loggedIn && sub.owner.uid === currentUser.uid ?
          <div>
            <button onClick={editSubHandler}>Edit Sub</button>
          </div> :
          null
        }
        { 
          loggedIn &&
          <Link to="new_post">
            <button>Create Post</button>
          </Link>
        }
      </div>

      <div className={styles.moderatorList}>
        <p>Moderators</p>
        {
          sub.moderators.map((modUid) => {
            return (
              <Link to={`/u/${modUid}/${userList[modUid].name}`} className='default-link'>
                <p>u/{userList[modUid].name}</p>
              </Link>
            )
          })
        }
      </div>
    </div>
  );
};

export default AboutSection;