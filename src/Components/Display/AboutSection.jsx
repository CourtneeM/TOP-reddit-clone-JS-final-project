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

function AboutSection({ loggedIn, currentUser, sub, deleteSub }) {
  const navigate = useNavigate();

  const deleteSubHandler = () =>{
    if (sub.owner.uid === currentUser.uid) deleteSub(sub.name);

    navigate('/');
  }

  return (
    <About>
      <h3>About</h3>
      <p>{sub.about ? sub.about : `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Velit deserunt maxime magnam repudiandae,
        dolore dolores, rem quasi odio recusandae omnis quis! Temporibus consequatur optio ratione cumque
        vero nemo non provident!`}</p>
      <p>Owner: 
        <Link to={`/u/${sub.owner.uid}/${sub.owner.name}`}>
          u/{sub.owner.name}
        </Link>
      </p>
      <p>{sub.followers.length ? sub.followers.length : 0} Followers</p>
      <p>Created {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
      { loggedIn &&
        <Link to="new_post">
          <button>Create Post</button>
        </Link>
      }
      {
        loggedIn && sub.owner.uid === currentUser.uid && <button onClick={deleteSubHandler}>Delete Sub</button>
      }
    </About>
  );
};

export default AboutSection;