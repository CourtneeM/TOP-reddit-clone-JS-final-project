import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin-right: 80px;
  margin-bottom: 20px;
  padding: 20px 60px;
  background-color: #bbb;
`;
const Body = styled.div`
  margin-bottom: 15px;

  h4 {
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
`;

function PostPreview({ sub }) {
  return (
    <Wrapper>
      <Body>
        <h4>r/ {sub.name}</h4>
        <p>{sub.subTitle}</p>
      </Body>
    </Wrapper>
  );
};

export default PostPreview;