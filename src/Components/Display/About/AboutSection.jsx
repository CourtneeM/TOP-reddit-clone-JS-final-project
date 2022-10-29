import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogInOutContext } from '../../Contexts/LogInOutContext';
import { UserContext } from '../../Contexts/UserContext';

import styles from './AboutSection.module.css';

function AboutSection({ sub }) {
  const { loggedIn } = useContext(LogInOutContext);
  const { userList, currentUser } = useContext(UserContext);

  const navigate = useNavigate();

  const editSubHandler = () => {
    navigate(`/r/${sub.name}/edit_sub`);
  }

  const display = (() => {
    const subDetails = () => {
      return (
        <>
          <h3>About</h3>
          <p>{sub.about}</p>
          <p>Created {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
          <p>Owner:
            <Link to={`/u/${sub.owner.uid}/${sub.owner.name}`} className='default-link'>
              u/{sub.owner.name}
            </Link>
          </p>
          <p>{sub.followers.length ? sub.followers.length : 0} <span>Followers</span></p>
        </>
      );
    }
    const subOptions = () => {
      return (
        <>
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
        </>
      );
    }
    const moderatorList = () => {
      return (
        sub.moderators.map((modUid) => {
          return (
            <Link to={`/u/${modUid}/${userList[modUid].name}`} className='default-link'>
              <p>u/{userList[modUid].name}</p>
            </Link>
          )
        })
      );
    }

    return { subDetails, subOptions, moderatorList }
  })();

  return (
    <div className={styles.about}>
      <header>
        { display.subDetails() } 
      </header>

      <div className={styles.subOptions}>
        { display.subOptions() }
      </div>

      <div className={styles.moderatorList}>
        <p>Moderators</p>
        { display.moderatorList() }
      </div>
    </div>
  );
};

export default AboutSection;