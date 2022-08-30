import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

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

  input:first-child {
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
`;
const SubmitPost = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    padding: 7px 15px;
    cursor: pointer;
  }
`;

function CreateSubPage({ loggedIn, createSub }) {
  const [subName, setSubName] = useState('');

  const navigate = useNavigate();

  const createSubHandler = (e) => {
    e.preventDefault();

    createSub(subName);
    setSubName('');

    navigate('/');
  }

  return (
    <div>
      <Navbar />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Create a Sub</p>
            </Header>

            <SubContent>
              <div>
                <input type="text" placeholder="Title" value={subName} onChange={(e) => setSubName(e.target.value)} />
                <p>r/</p>
              </div>
            </SubContent>

            <SubmitPost>
              <button onClick={(e) => createSubHandler(e)}>Create Sub</button>
            </SubmitPost>
          </> :
          <p>You must be logged in to create a new post.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default CreateSubPage;