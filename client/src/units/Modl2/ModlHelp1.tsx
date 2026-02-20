import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faTelegramPlane, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faHandshake } from "@fortawesome/free-regular-svg-icons";

function Collections() {
  const [showHelp, setShowHelp] = useState(false);
  const helpModalRef = useRef(null);

  const handleClick = () => {
    setShowHelp(!showHelp);
  };
  
  const Github = () => {
    window.open("https://github.com/cryptogopniks", "_blank");
  };

  const Twitter = () => {
    window.open("https://twitter.com/StarGops_nft", "_blank");
  };

  const Telegramm = () => {
    window.open("https://t.me/CryptoGopnik_ru", "_blank");
  };

  const Me = () => {
    window.open("https://t.me/MegaBzlomJopu", "_blank");
  };
  
  
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpModalRef.current && !helpModalRef.current.contains(event.target)) {
        setShowHelp(false);
      }
    };

    if (showHelp) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHelp]);

  return (
    <div className={styles.collections} onClick={handleClick}>
      <div
        style={{
          marginRight: '6px',
          top: '2px',
          position: 'relative',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
            stroke="#EFEFEF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9C9 5.5 14.5 5.5 14.5 9C14.5 11.5 12 11 12 14M12 18.01L12.01 17.999"
            stroke="#EFEFEF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={`${styles.HELP}`} >
        Help
      </div>
      {showHelp && (
        <div className={styles.help_modal2} ref={helpModalRef}>
          <button onClick={Telegramm} style={{ width: '100%' }}><FontAwesomeIcon icon={faTelegramPlane} />&nbsp;&nbsp;Join our Community</button>
          <button onClick={Twitter} style={{ width: '100%' }}><FontAwesomeIcon icon={faTwitter}/>&nbsp;&nbsp;Twitter (X)</button>
          <button onClick={Me} style={{ width: '100%' }}><FontAwesomeIcon icon={faHandshake} />&nbsp;&nbsp;Contact us</button>
          <button onClick={Github} style={{ width: '100%' }}><FontAwesomeIcon icon={faGithub}/>&nbsp;&nbsp;Github</button>
        </div>
      )}
    </div>
  );
}

export default Collections;