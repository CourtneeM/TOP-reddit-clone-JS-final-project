import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin: 0 80px 20px 0;
  padding: 20px 60px;
  background-color: #bbb;
`;
const Header = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;

  p:first-child span {
    cursor: pointer;
  }

  p:last-child {
    font-style: italic;
    color: #555;
  }
`;
const Body = styled.div`
  margin-bottom: 15px;

  h4 {
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
`;
const Options = styled.div`
  display: flex;
  gap: 40px;

  p {
    cursor: pointer;
  }

  p:nth-child(2) {
    margin-left: auto;
  }
`;
const VoteStatus = styled.div`
  position: absolute;
  top: 20px;
  left: 25px;

  p:nth-child(2n+1) {
    cursor: pointer;
  }
`;

function PostPreview() {
  return (
    <Wrapper>
      <Header>
        <p>Posted by <span>u/username</span></p>
        <p>Creation Date</p>
      </Header>
      <Body>
        <h4>Title</h4>
        <p>Text preview / Image preview</p>
      </Body>
      <Options>
        <p># comments</p>
        <p>Favorite</p>
        <p>Share</p>
      </Options>
      <VoteStatus>
        <p>^</p>
        <p>#</p>
        <p>v</p>
      </VoteStatus>
    </Wrapper>
  );
};

export default PostPreview;