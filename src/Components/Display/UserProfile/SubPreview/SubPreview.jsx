import styles from './SubPreview.module.css';

function SubPreview({ sub }) {
  const shareSubHandler = () => {
    const initialUrl = window.location.href.slice(0, window.location.href.lastIndexOf('/u/'));
    navigator.clipboard.writeText(`${initialUrl}/r/${sub.name}`);

    const shareBtn = document.getElementById(`sub-${sub.name}`).querySelector('.share-btn');
    shareBtn.textContent = 'Link copied';
    setTimeout(() => shareBtn.textContent = 'Share', 5000);
  }
  return (
    <div id={`sub-${sub.name}`} className={styles.wrapper}>
      <body>
        <h4>r/ {sub.name}</h4>
        <p>{sub.subTitle}</p>
      </body>
      <div className={styles.subActions}>
        <p>{sub.followers.length} Followers</p>
        <p className='share-btn' onClick={shareSubHandler}>Share</p>
      </div>
    </div>
  );
};

export default SubPreview;