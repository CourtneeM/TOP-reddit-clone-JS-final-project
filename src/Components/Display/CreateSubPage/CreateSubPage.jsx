import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Navbar from "../Navbar/Navbar";

import styles from './CreateSubPage.module.css';

function CreateSubPage({ loggedIn, signInOut, currentUser, subList, createSub }) {
  const [subName, setSubName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subAbout, setSubAbout] = useState('');

  const navigate = useNavigate();

  const createSubHandler = (e) => {
    e.preventDefault();

    if (subName === '') return displayInputError('empty');
    if (subName.split(' ').join('') !== subName ) return displayInputError('space');
    if (!(/^[a-z\d\-_]+$/i).test(subName)) return displayInputError('non-alphanumeric');
    if (subList[subName]) return displayInputError('exists');

    createSub(subName, subtitle, subAbout);
    navigate(`/r/${subName}`);
    
    setSubName('');
    setSubtitle('');
    setSubAbout('');
  }
  const displayInputError = (type) => {
    const nameErrorMsg = document.querySelector('.name-error-msg');

    if (type === 'empty') nameErrorMsg.textContent = 'Error: Sub name cannot be empty';
    if (type === 'space') nameErrorMsg.textContent = 'Error: Sub name cannot contain spaces';
    if (type === 'non-alphanumeric') nameErrorMsg.textContent = 'Error: Sub name must be alphanumeric';
    if (type === 'exists') nameErrorMsg.textContent = 'Error: Sub name already exists';
    
    setTimeout(() => {
      nameErrorMsg.classList.add(styles.hidden);
    }, 5000);
    nameErrorMsg.classList.remove(styles.hidden);
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <div className={styles.wrapper}>
        { loggedIn ?
          <>
            <header>
              <p>Create a Sub</p>
            </header>

            <div className={styles.subContent}>
              <div>
                <input type="text" name="subname" id="subname" placeholder="Name" required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                />
                <p>r/</p>
              </div>
              <div>
                <input type="text" name="subtitle" id="subtitle" placeholder="Subtitle (optional)"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <textarea name="sub-about" id="sub-about" cols="30" rows="10" placeholder="About (optional)"
                  value={subAbout}
                  onChange={(e) => setSubAbout(e.target.value)}
                >
                </textarea>
              </div>
              <p className={`name-error-msg ${styles.nameErrorMsg} ${styles.hidden}`}></p>

              <div className={styles.submitSub}>
                <button onClick={(e) => createSubHandler(e)}>Create Sub</button>
              </div>
            </div>
          </> :
          <p>You must be logged in to create a new sub.</p>
        }
          
      </div>
    </div>
  );
};

export default CreateSubPage;