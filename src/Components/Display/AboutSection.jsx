import { useNavigate, Link } from 'react-router-dom';

import styled from "styled-components";

const About = styled.div`
  flex-basis: 280px;
  justify-self: flex-end;
  padding: 25px 25px 60px;
  height: fit-content;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);

  button {
    width: 100%;
    padding: 7px;
    cursor: pointer;
  }
`;
const Header = styled.div`
  margin-bottom: 30px;

  h3 {
    margin-bottom: 15px;
    font-size: 1.25rem;
  }
  p { margin-bottom: 15px; }
  p:nth-child(4) {
    margin-bottom: 30px;

    a {
      margin-left: 5px;
      color: #000;
    }
  }

  p:last-child {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;

    span {
      flex: 100%;
      font-size: 0.875rem;
    }
  }
`;
const SubOptions = styled.div`
  margin-bottom: 40px;

  div {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  button {
    width: 230px;
    padding: 8px 25px;
    background-color: #d9d9d9;
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
    cursor: pointer;
  }
`;
const ModeratorList = styled.div`
  > p:first-child {
    font-size: 1.25rem;
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
      <Header>
        <h3>About</h3>
        <p>{sub.about}</p>
        <p>Created {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
        <p>Owner:
          <Link to={`/u/${sub.owner.uid}/${sub.owner.name}`} className='default-link'>
            u/{sub.owner.name}
          </Link>
        </p>
        <p>{sub.followers.length ? sub.followers.length : 0} <span>Followers</span></p>
      </Header>
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