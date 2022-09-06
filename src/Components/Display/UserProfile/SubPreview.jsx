import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin-right: 80px;
  margin-bottom: 20px;
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

function PostPreview({ sub }) {
  return (
    <Wrapper>
      <Header>
        <p>Posted by <span>u/{sub.owner.name}</span></p>
        <p>{`${sub.creationDateTime.date.month}/${sub.creationDateTime.date.day}/${sub.creationDateTime.date.year}`}</p>
      </Header>
      <Body>
        <h4>{sub.name}</h4>
        <p>{sub.subTitle}</p>
      </Body>
    </Wrapper>
  );
};

export default PostPreview;