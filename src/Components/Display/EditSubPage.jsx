import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

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
const SubmitPost = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    padding: 7px 15px;
    cursor: pointer;
  }
`;

function EditSubPage({ loggedIn, currentUser, subList, editSub }) {
  const [sub, setSub] = useState({});
  const [subTitle, setSubTitle] = useState('');
  const [subAbout, setSubAbout] = useState('');

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setSub(subList[params.subName]);
    setSubTitle(subList[params.subName].subTitle);
    setSubAbout(subList[params.subName].about);
  }, [subList]);

  const editSubHandler = () => {
    const subCopy = {...sub};

    subCopy.subTitle = subTitle;
    subCopy.about = subAbout;

    editSub(subCopy)

    navigate(`/r/${sub.name}`)
  }

  const cancelEditSubHandler = () => navigate(`/r/${sub.name}`);

  return (
    <div>
      <Navbar currentUser={currentUser} subList={subList} />

      <Wrapper>
        { loggedIn ?
          <>
            <Header>
              <p>Edit r/{sub.name}</p>
            </Header>

            <SubContent>
              <div>
                <p>Subtitle</p>
                <input type="text" name="subtitle" id="subtitle" placeholder='Coolest place on the web' value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
              </div>
              <div>
                <p>About Section</p>
                <textarea name="about" id={`about-${sub.name}`} value={subAbout} onChange={(e) => setSubAbout(e.target.value)}  cols="30" rows="10"></textarea>
              </div>
              <div>
                <p>Moderators</p>
                <ul>
                  <li>Ricky</li>
                  <li>Lilly</li>
                  <li>Mike</li>
                  <li>Kevin</li>
                  <li>Brenden</li>
                </ul>
              </div>
              <div>

              </div>
            </SubContent>

            <SubmitPost>
              <button onClick={editSubHandler}>Save Changes</button>
              <button onClick={cancelEditSubHandler}>Cancel Changes</button>
            </SubmitPost>
          </> :
          <p>You must be logged in to create a new post.</p>
        }
          
      </Wrapper>
    </div>
  );
};

export default EditSubPage