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

function Navbar() {


  return (
    <Wrapper>
      <p>Readdit</p>

      <ul>
        <Link to="/">
          <li>Home</li>
        </Link>
        <Link to="/r/all">
          <li>All</li>
        </Link>
        <Link to="/r/digital_art">
          <li>Digital Art</li>
        </Link>
        <Link to="/r/games">
          <li>Games</li>
        </Link>
      </ul>

      {/* <button>Create Sub</button> */}
    </Wrapper>
  );
};

export default Navbar;