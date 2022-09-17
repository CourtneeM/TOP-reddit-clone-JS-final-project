import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 60px;
  box-shadow: 0 4px 12px 4px #ccc;

  p {
    font-size: 1.4rem;
    padding: 15px 0;
    cursor: pointer;
  }

  ul {
    display: flex;
    
    li {
      padding: 15px 30px;
      cursor: pointer;
    }
  }
`;

function Navbar({ loggedIn, signInOut, currentUser, subList }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && Object.values(currentUser).length > 0) {
      setLoading(false);
    }
  }, [currentUser]);

  const getSubNames = () => {
    return Object.values(subList).map((sub) => {
      return (
        <Link to={`/r/${sub.name}`} key={sub.name} >
          <li>{sub.name}</li>
        </Link>
      );
    });
  }

  return (
    <Wrapper>
      <Link to="/">
        <p>Readdit</p>
      </Link>

      <ul>
        <Link to="/">
          <li>Home</li>
        </Link>
        <Link to="/r/all">
          <li>All</li>
        </Link>
        {
          getSubNames()
        }
        <Link to="/r/new_sub">
          <li>Create Sub</li>
        </Link>
      </ul>

      { loggedIn ?
          loading ?
          <p>Loading...</p> :
          <div>
            <Link to={`/u/${currentUser.uid}/${currentUser.name}`}>
              <p>u/{currentUser.name}</p>
            </Link>
            <button onClick={signInOut.signUserOut}>Sign Out</button>
          </div> :
        <button onClick={signInOut.signUserIn}>Sign In</button>
      }
    </Wrapper>
  );
};

export default Navbar;