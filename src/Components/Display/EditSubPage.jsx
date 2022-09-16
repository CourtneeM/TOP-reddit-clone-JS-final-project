import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1200px;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  display: flex;  
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px 0;

  p:first-child {
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: bold;
  }
`;
const Submit = styled.div`
  button {
    padding: 7px 15px;
    cursor: pointer;
  }
`;
const SubContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  margin: 60px auto 80px;
  padding: 0 40px;

  div:first-child {
    flex-basis: 65%;
  }

  div:last-child {
    flex-basis: 30%;
  }

  input {
    width: 100%;
    margin-bottom: 20px;
    padding: 10px 25px;
    font-size: 1rem;
  }

  textarea {
    width: 100%;
    margin-bottom: 20px;
    padding: 10px 25px;
    font-size: 1rem;
  }
`;
const ModeratorList = styled.div`
  background-color: #ddd;

  div:first-child {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;

    p {
      font-size: 1.2rem;
      font-weight: bold;
    }

    button {
      padding: 7px 15px;
      cursor: pointer;
    }
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    text-align: center;

    li:first-child {
      flex-basis: 100%;
      margin-bottom: 30px;
    }

    li {
      flex-basis: 50%;
      margin-bottom: 20px;
    }
  }

  .follower-list {
    height: 100px;
    width: 80%;
    margin: 0 auto;
    overflow-y: scroll;

    p {
      padding: 8px;
      border-bottom: 1px solid #aaa;
      cursor: pointer;
    }

    .moderator {
      background-color: limegreen;
    }
  }
`;
const DeleteSub = styled.button`
  padding: 10px 15px;
  color: #fff;
  background-color: red;
  border: none;
  cursor: pointer;
`;

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

  const cancelEditSubHandler = () => navigate(`/r/${sub.name}`);

  const toggleModerator = (e) => {
    e.target.classList.toggle('moderator');
  }

  const deleteSubHandler = () =>{
    if (sub.owner.uid === currentUser.uid) deleteSub(sub.name);

    navigate('/');
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Edit r/{sub.name}</p>
              <Submit>
                <button onClick={editSubHandler}>Save Changes</button>
                <button onClick={cancelEditSubHandler}>Cancel Changes</button>
              </Submit>
            </Header>

            <SubContent>
              <div>
                <div>
                  <p>Subtitle</p>
                  <input type="text" name="subtitle" id="subtitle" placeholder='Coolest place on the web' value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
                </div>
                <div>
                  <p>About Section</p>
                  <textarea name="about" id={`about-${sub.name}`} value={subAbout} onChange={(e) => setSubAbout(e.target.value)}  cols="30" rows="10"></textarea>
                </div>
              </div>

              <ModeratorList>
                <div>
                  <p>Moderators</p>
                  { editModList ?
                    <button onClick={saveEditModeratorList}>Save</button> :
                    <button onClick={editModeratorList}>Edit</button>
                  }
                </div>
                <ul>
                  <li>Only displaying users who follow the sub</li>
                  {
                    modList.map((modUid) => {
                      return <li>{userList[modUid].name}</li>
                    })
                  }
                </ul>
                { editModList ?
                  <div className='follower-list'>
                    {
                      sub.followers.map((followerUid) => {
                        return <p id={followerUid} className={modList.includes(followerUid) ? 'moderator' : null} onClick={
                          (e) => toggleModerator(e)}>{userList[followerUid].name
                        }</p>
                      })
                    }
                  </div> :
                  null
                }
              </ModeratorList>
            </SubContent>
            <DeleteSub onClick={deleteSubHandler}>Delete Sub</DeleteSub>
          </> :
          <p>You must be logged in and own the sub to edit.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default EditSubPage