import { useNavigate, Link } from 'react-router-dom';

import styled from "styled-components";

const About = styled.div`
  flex: 25%;
  padding: 10px;
  padding-top: 0;

  h3 {
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 10px;
  }

  button {
    width: 100%;
    padding: 7px;
    cursor: pointer;
  }
`;
const SubOptions = styled.div`
  margin-bottom: 40px;

  div {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
`;
const ModeratorList = styled.div`
  > p:first-child {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

function AboutSection({ loggedIn, currentUser, userList, sub }) {
  const navigate = useNavigate();

  const editSubHandler = () => {
    navigate(`/r/${sub.name}/edit_sub`);
  }

  

  return (
    <About>
      <h3>About</h3>
      <p>{sub.about}</p>
      <p>Owner:
        <Link to={`/u/${sub.owner.uid}/${sub.owner.name}`}>
          u/{sub.owner.name}
        </Link>
      </p>
      <p>{sub.followers.length ? sub.followers.length : 0} Followers</p>
      <p>Created: {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
      <SubOptions>
        {
          loggedIn && sub.owner.uid === currentUser.uid ?
          <div>
            <button onClick={editSubHandler}>Edit Sub</button>
          </div> :
          null
        }
        { 
          loggedIn &&
          <Link to="new_post">
            <button>Create Post</button>
          </Link>
        }
      </SubOptions>
      <ModeratorList>
        <p>Moderators</p>
        {
          sub.moderators.map((modUid) => {
            return (
              <Link to={`/u/${modUid}/${userList[modUid].name}`}>
                <p>u/{userList[modUid].name}</p>
              </Link>
            )
          })
        }
      </ModeratorList>
    </About>
  );
};

export default AboutSection;