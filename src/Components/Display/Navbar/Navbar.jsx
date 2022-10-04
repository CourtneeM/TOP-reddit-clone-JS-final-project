import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './Navbar.module.css';

function Navbar({ loggedIn, signInOut, currentUser, subList, currentSub }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && Object.values(currentUser).length > 0) {
      setLoading(false);
    }
  }, [currentUser]);


  const display = (() => {
    const subNamesList = () => {
      return ['Home', 'All', ...Object.values(subList)].map((sub) => {
        const subName = sub.name ? sub.name : sub;
  
        return (
          <Link to={subName === 'Home' ? '/' : `/r/${subName}`} key={subName} className='default-link'>
            <li className={subName === currentSub ? styles.selectedSub : null}>{subName}</li>
          </Link>
        );
      });
    }

    const loggedInUser = () => {
      return (
        <div>
          <Link to={`/u/${currentUser.uid}/${currentUser.name}`} className='default-link'>
            <p className={styles.userName}>u/{currentUser.name}</p>
          </Link>
          <button className={styles.signInOutBtn} onClick={signInOut.signUserOut}>Sign Out</button>
        </div>
      );
    }

    return { subNamesList, loggedInUser }
  })();

  return (
    <div className={styles.wrapper}>
      <Link to="/" className='default-link'>
        <h1>Readdit</h1>
      </Link>

      <div className={styles.subList}>
        { display.subNamesList() }
        {
          loggedIn ?
          <Link to="/r/new_sub" className='default-link'>
            <li>Create Sub</li>
          </Link> :
          null
        }
      </div>

      { loggedIn ?
          loading ?
          <p>Loading...</p> :
          display.loggedInUser() :
        <button className={styles.signInOutBtn} onClick={signInOut.signUserIn}>Sign In</button>
      }
    </div>
  );
};

export default Navbar;