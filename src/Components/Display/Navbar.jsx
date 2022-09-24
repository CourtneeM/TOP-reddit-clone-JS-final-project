import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 60px;
  background-color: #d9d9d9;
  box-shadow: 0 4px 4px 4px rgba(0,0,0,0.25);

  h1 {
    font-size: 1.75rem;
    padding: 15px 0;
    cursor: pointer;
  }

  div:last-child {
    display: flex;
    align-items: center;

    .user-name {
      margin-right: 40px;
    }
  }

  a { color: #000; }
`;
const SubList = styled.ul`
  display: flex;
  gap: 46px;
  
  li {
    padding: 4px 4px;
    cursor: pointer;
  }

  .selected-sub {
    border-bottom: 3px solid #fff;
  }
`;
const SignInOutBtn = styled.button`
  padding: 8px 25px;
  size: 0.875px;
  border: none;
  border-radius: 20px;
  box-shadow: 0px 4px 4px 0 rgba(0,0,0,0.25);
  cursor: pointer;
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
        <Link to={`/r/${sub.name}`} key={sub.name}  className='default-link'>
          <li>{sub.name}</li>
        </Link>
      );
    });
  }

  return (
    <Wrapper>
      <Link to="/" className='default-link'>
        <h1>Readdit</h1>
      </Link>

      <SubList>
        <Link to="/" className='default-link'>
          <li className='selected-sub'>Home</li>
        </Link>
        <Link to="/r/all" className='default-link'>
          <li>All</li>
        </Link>
        {
          getSubNames()
        }
        <Link to="/r/new_sub" className='default-link'>
          <li>Create Sub</li>
        </Link>
      </SubList>

      { loggedIn ?
          loading ?
          <p>Loading...</p> :
          <div>
            <Link to={`/u/${currentUser.uid}/${currentUser.name}`} className='default-link'>
              <p className='user-name'>u/{currentUser.name}</p>
            </Link>
            <SignInOutBtn onClick={signInOut.signUserOut}>Sign Out</SignInOutBtn>
          </div> :
        <SignInOutBtn onClick={signInOut.signUserIn}>Sign In</SignInOutBtn>
      }
    </Wrapper>
  );
};

export default Navbar;