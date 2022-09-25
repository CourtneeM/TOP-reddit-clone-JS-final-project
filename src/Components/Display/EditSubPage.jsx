import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1080px;
  min-width: 800px;
  margin: 0 auto;
  padding: 70px 0;
`;
const Header = styled.div`
  display: flex;  
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  p {
    font-size: 1.5rem;
  }
`;
const SubContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  margin-bottom: 100px;
  padding: 50px 40px;
  background-color: #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);

  div:first-child {
    flex-basis: 65%;
  }

  input, textarea {
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
  }

  textarea { resize: none; }
`;
const ModeratorList = styled.div`
  flex-basis: 30%;
  max-height: 350px;
  padding: 20px 40px;
  background-color: #fff;
  border-radius: 8px;
  overflow-y: scroll;

  > p {
    &:first-child {
      margin-bottom: 10px;
      font-weight: bold;
      text-align: center;
    }

    &:nth-child(2) {
      font-size: 0.875rem;
      text-align: center;
    }
  }

  ul {
    margin-bottom: 20px;
    text-align: center;

    li {
      margin-bottom: 15px;

      &:first-child { margin-top: 20px; }
    }
  }

  .follower-list {
    height: 100px;
    margin: 0 auto 20px;
    overflow-y: scroll;

    p {
      margin: 2px 0;
      padding: 3px;
      cursor: pointer;
    }

    .moderator {
      background-color: rgba(208,252,204,0.7);
      border-left: 4px solid rgb(21,242,2);
    }
  }
`;
const EditModsBtn = styled.div`
  display: flex;
  justify-content: center;

  div {
    display: flex;
    gap: 20px;
  }

  button {
    width: 90%;
    min-width: 75px;
    padding: 6px 25px;
    background-color: #d9d9d9;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
    cursor: pointer;
  }
`;
const Submit = styled.div`
  margin: 0 auto;

  button {
    padding: 8px 25px;
    background-color: #fff;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
    cursor: pointer;

    &:first-child { margin-right: 20px; }
    &:last-child { background-color: limegreen; }
  }
`;
const DeleteSub = styled.div`
  width: fit-content;
  margin: 0 auto;
  text-align: center;

  p {
    margin-bottom: 30px;
    font-weight: bold;
  }

  button {
    padding: 8px 25px;
    color: #fff;
    background-color: red;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
    cursor: pointer;
  }
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
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Edit r/{sub.name}</p>
            </Header>

            <SubContent>
              <div>
                <div>
                  <input type="text" name="subtitle" id="subtitle" placeholder='Subtitle' value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
                </div>
                <div>
                  <textarea name="about" id={`about-${sub.name}`} placeholder="About (optional)" value={subAbout} onChange={(e) => setSubAbout(e.target.value)}  cols="30" rows="10"></textarea>
                </div>
              </div>

              <ModeratorList>
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
                <EditModsBtn>
                  { editModList ?
                    <div>
                      <button onClick={() => setEditModList(false)}>Cancel</button>
                      <button onClick={saveEditModeratorList}>Save</button>
                    </div> :
                    <button onClick={editModeratorList}>Edit</button>
                  }
                </EditModsBtn>
              </ModeratorList>
              <Submit>
                <button onClick={cancelEditSubHandler}>Cancel</button>
                <button onClick={editSubHandler}>Save</button>
              </Submit>
            </SubContent>
            <DeleteSub>
              <p>Caution: Deleted subs cannot be recovered</p>
              <button onClick={deleteSubHandler}>Delete Sub</button>
            </DeleteSub>
          </> :
          <p>You must be logged in and own the sub to edit.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default EditSubPage