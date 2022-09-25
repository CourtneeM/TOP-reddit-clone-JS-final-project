import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1000px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 70px 0 40px;
`;
const Header = styled.div`
  margin-bottom: 40px;

  p {
    font-size: 1.5rem;
    font-weight: bold;
  }
`;
const SubContent = styled.div`
  position: relative;
  padding: 50px 140px;
  background-color: #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);

  div {
    margin-bottom: 30px;

    &:last-child { margin-bottom: 0; }

    input, textarea {
      width: 100%;
      padding: 25px;
      font-size: 1rem;
      border: none;
      border-radius: 8px;

      &:first-child { padding: 10px 25px; }
    }

    textarea { resize: none; }

    p {
      position: absolute;
      top: 56px;
      left: 150px;
    }
  }

  .name-error-msg {
    color: red;
  }

  .hidden {
    display: none;
  }
`;
const SubmitPost = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    padding: 7px 25px;
    background-color: #fff;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
    cursor: pointer;
  }
`;

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
      nameErrorMsg.classList.add('hidden');
    }, 5000);
    nameErrorMsg.classList.remove('hidden');
  }

  return (
    <div>
      <Navbar loggedIn={loggedIn} signInOut={signInOut} currentUser={currentUser} subList={subList} />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Create a Sub</p>
            </Header>

            <SubContent>
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
              <p className='name-error-msg hidden'></p>

              <SubmitPost>
                <button onClick={(e) => createSubHandler(e)}>Create Sub</button>
              </SubmitPost>
            </SubContent>
          </> :
          <p>You must be logged in to create a new sub.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default CreateSubPage;