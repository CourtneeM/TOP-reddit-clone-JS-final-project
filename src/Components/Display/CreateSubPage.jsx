import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Navbar from "./Navbar";

import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 1200px;
  width: 50%;
  min-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
`;
const Header = styled.div`
  margin-bottom: 20px;
  padding: 20px 0;

  p:first-child {
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: bold;
  }
`;
const SubContent = styled.div`
  position: relative;
  margin: 60px auto 80px;
  padding: 0 40px;

  div {

    input {
      width: 100%;
      margin-bottom: 20px;
      padding: 10px 25px;
      font-size: 1rem;
    }

    p {
      position: absolute;
      top: 9px;
      left: 50px;
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
    padding: 7px 15px;
    cursor: pointer;
  }
`;

function CreateSubPage({ loggedIn, signInOut, currentUser, subList, createSub }) {
  const [subName, setSubName] = useState('');

  const navigate = useNavigate();

  const createSubHandler = (e) => {
    e.preventDefault();

    if (subName === '') return displayInputError('empty');
    if (subName.split(' ').join('') !== subName ) return displayInputError('space');
    if (!(/^[a-z\d\-_]+$/i).test(subName)) return displayInputError('non-alphanumeric');
    if (subList[subName]) return displayInputError('exists');

    createSub(subName);
    navigate(`/r/${subName}`);
    
    setSubName('');
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
                <input type="text" placeholder="Title" required value={subName} onChange={(e) => setSubName(e.target.value)} />
                <p>r/</p>
              </div>
              <p className='name-error-msg hidden'></p>
            </SubContent>

            <SubmitPost>
              <button onClick={(e) => createSubHandler(e)}>Create Sub</button>
            </SubmitPost>
          </> :
          <p>You must be logged in to create a new sub.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default CreateSubPage;