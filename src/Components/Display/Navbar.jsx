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
        <li>Home</li>
        <li>All</li>
        <li>Art</li>
        <li>Games</li>
      </ul>
    </Wrapper>
  );
};

export default Navbar;