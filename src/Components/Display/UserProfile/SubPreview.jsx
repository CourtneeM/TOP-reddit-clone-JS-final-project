import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
  padding: 25px 50px 65px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.25);
`;
const Body = styled.div`
  margin-bottom: 15px;

  h4 {
    margin-bottom: 20px;
    font-size: 1.25rem;
  }
`;
const SubActions = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  padding: 9px 25px;
  background-color: #d9d9d9;
  border-radius: 0 8px 0 8px;

  div {
    display: flex;
    gap: 25px;

    &:nth-child(2) p {
      cursor: pointer;
    }
  }

  .link-copied-msg {
    position: absolute;
    top: -30px;
    right: -60px;
    text-align: center;
    font-size: 0.9rem;
    background-color: #fff;
  }
`;

function SubPreview({ sub }) {
  const shareSubHandler = () => {
    const initialUrl = window.location.href.slice(0, window.location.href.lastIndexOf('/u/'));
    navigator.clipboard.writeText(`${initialUrl}/r/${sub.name}`);

    const shareBtn = document.getElementById(`sub-${sub.name}`).querySelector('.share-btn');
    shareBtn.textContent = 'Link copied';
    setTimeout(() => shareBtn.textContent = 'Share', 5000);
  }
  return (
    <Wrapper id={`sub-${sub.name}`}>
      <Body>
        <h4>r/ {sub.name}</h4>
        <p>{sub.subTitle}</p>
      </Body>
      <SubActions>
        <p>{sub.followers.length} Followers</p>
        <p className='share-btn' onClick={shareSubHandler}>Share</p>
      </SubActions>
    </Wrapper>
  );
};

export default SubPreview;