import { Link } from 'react-router-dom';

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

function AboutSection({ loggedIn, sub, deleteSub }) {
  return (
    <About>
      <h3>About</h3>
      <p>{sub.about ? sub.about : `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Velit deserunt maxime magnam repudiandae,
        dolore dolores, rem quasi odio recusandae omnis quis! Temporibus consequatur optio ratione cumque
        vero nemo non provident!`}</p>
      <p>{sub.followers.length ? sub.followers.length : 0} Followers</p>
      <p>Created {sub.creationDateTime.date.month}/{sub.creationDateTime.date.day}/{sub.creationDateTime.date.year}</p>
      { loggedIn &&
        <Link to="new_post">
          <button>Create Post</button>
        </Link>
      }
      {
        loggedIn && 'owner.uid matches sub.owner.uid' && <button onClick={deleteSub}>Delete Sub</button>
      }
    </About>
  );
};

export default AboutSection;