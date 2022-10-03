import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from "../Navbar/Navbar";

import styles from './EditSubPage.module.css';

function EditSubPage({ loggedIn, signInOut, currentUser, userList, subList, editSub, deleteSub }) {
  const [sub, setSub] = useState({});
  const [subTitle, setSubTitle] = useState('');
  const [subAbout, setSubAbout] = useState('');
  const [editModList, setEditModList] = useState(false);
  const [modList, setModList] = useState([]);
  const [removedMods, setRemovedMods] = useState([]);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setSub(subList[params.subName]);
    setSubTitle(subList[params.subName].subTitle);
    setSubAbout(subList[params.subName].about);
    setModList(subList[params.subName].moderators);
  }, [subList]);

  const editSubHandler = () => {
    const subCopy = {...sub};

    subCopy.subTitle = subTitle;
    subCopy.about = subAbout;
    subCopy.moderators = modList;

    editSub(subCopy, removedMods);

    navigate(`/r/${sub.name}`);
  }
  const cancelEditSubHandler = () => navigate(`/r/${sub.name}`);
  const deleteSubHandler = () =>{
    if (sub.owner.uid === currentUser.uid) deleteSub(sub.name);

    navigate('/');
  }

  const editModeratorList = () => {
    setEditModList(true);
  }
  const saveEditModeratorList = () => {
    const newMods = [];
    [...document.querySelectorAll('.moderator')].forEach((el) => {
      newMods.push(el.id);
    });

    let newRemovedMods = removedMods;
    modList.forEach((modUid) => {
      if (!newMods.includes(modUid) && !newRemovedMods.includes(modUid)) newRemovedMods.push(modUid);
    });

    newRemovedMods.forEach((removedModUid, index) => {
      if (newMods.includes(removedModUid)) newRemovedMods.splice(index, 1); 
    });

    setRemovedMods(newRemovedMods);
    setModList(newMods);
    setEditModList(false);
  }
  const toggleModerator = (e) => {
    e.target.classList.toggle('moderator');
    e.target.classList.toggle(styles.moderator);
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <div className={styles.wrapper}>
        { loggedIn ?
          <>
            <header>
              <p>Edit r/{sub.name}</p>
            </header>

            <div className={styles.subContent}>
              <div>
                <div>
                  <input type="text" name="subtitle" id="subtitle" placeholder='Subtitle' value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
                </div>
                <div>
                  <textarea name="about" id={`about-${sub.name}`} placeholder="About (optional)" value={subAbout} onChange={(e) => setSubAbout(e.target.value)}  cols="30" rows="10"></textarea>
                </div>
              </div>

              <div className={styles.moderatorList}>
                <p>Moderators</p>
                <p>Only displaying sub followers</p>
                <ul>
                  {
                    modList.map((modUid) => {
                      return <li>{userList[modUid].name}</li>
                    })
                  }
                </ul>
                { editModList ?
                  <div className={styles.followerList}>
                    {
                      sub.followers.map((followerUid) => {
                        return <p id={followerUid} className={modList.includes(followerUid) ? `moderator ${styles.moderator}` : null} onClick={
                          (e) => toggleModerator(e)}>{userList[followerUid].name
                        }</p>
                      })
                    }
                  </div> :
                  null
                }
                <div className={styles.editModsBtn}>
                  { editModList ?
                    <div>
                      <button onClick={() => setEditModList(false)}>Cancel</button>
                      <button onClick={saveEditModeratorList}>Save</button>
                    </div> :
                    <button onClick={editModeratorList}>Edit</button>
                  }
                </div>
              </div>
              <div className={styles.submit}>
                <button onClick={cancelEditSubHandler}>Cancel</button>
                <button onClick={editSubHandler}>Save</button>
              </div>
            </div>
            <div className={styles.deleteSub}>
              <p>Caution: Deleted subs cannot be recovered</p>
              <button onClick={deleteSubHandler}>Delete Sub</button>
            </div>
          </> :
          <p>You must be logged in and own the sub to edit.</p>
        }
          
      </div>
    </div>
  );
};

export default EditSubPage