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

  const getSubNames = () => {
    return ['Home', 'All', ...Object.values(subList)].map((sub) => {
      const subName = sub.name ? sub.name : sub;

      return (
        <Link to={subName === 'Home' ? '/' : `/r/${subName}`} key={subName} className='default-link'>
          <li className={subName === currentSub ? styles.selectedSub : null}>{subName}</li>
        </Link>
      );
    });
  }

  return (
    <div className={styles.wrapper}>
      <Link to="/" className='default-link'>
        <h1>Readdit</h1>
      </Link>

      <div className={styles.subList}>
        { getSubNames() }
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
          <div>
            <Link to={`/u/${currentUser.uid}/${currentUser.name}`} className='default-link'>
              <p className={styles.userName}>u/{currentUser.name}</p>
            </Link>
            <button className={styles.signInOutBtn} onClick={signInOut.signUserOut}>Sign Out</button>
          </div> :
        <button className={styles.signInOutBtn} onClick={signInOut.signUserIn}>Sign In</button>
      }
    </div>
  );
};

export default Navbar;