import { useContext, useEffect, useState } from 'react';
import TxHashContext from '../context/txHash';
import ReactModal from "react-modal";
import "../../css/style2.css"

const SomeOtherComponent = () => {
  const { txHash, text, setTxHash } = useContext(TxHashContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (txHash || text) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Закрыть модальное окно через 10 секунд

      
      return () => clearTimeout(timer);
    }
  }, [txHash, text]);

  const handleRequestClose = () => {
    setIsVisible(false);
  };

  return (
    <ReactModal
      isOpen={isVisible}
      onRequestClose={handleRequestClose}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false} // чтобы избежать предупреждения о доступности
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "250px",
          height: "160px",
          marginLeft: "auto",
          marginTop: "60px",
          marginRight: "40px",
          zIndex: "99999999999999",
          borderRadius: "6px",
          animation: "blink 1s infinite"
        },
        content: {
          position: "absolute",
          top: "1px",
          left: "1px",
          right: "1px",
          bottom: "1px",
          border: "0px",
          backgroundColor: "#19191c",
          color: "#fff",
          WebkitOverflowScrolling: "touch",
          borderRadius: "6px",
          outline: "none",
          padding: "16px",
          overflow: "hidden",
          display: "flex", // Используем flexbox для позиционирования крестика
          flexDirection: "column", // Вертикальное выравнивание
          alignItems: "flex-end", // Выравниваем крестик по правому краю
          overflowY:"auto"
        },
      }}
    >
      <button onClick={handleRequestClose} style={{ 
          position: "absolute", 
          top: "0px", 
          right: "3px", 
          backgroundColor: "transparent", 
          border: "none", 
          cursor: "pointer", 
          fontSize: "24px" 
      }}
      className='krest'
      >
        &times;
      </button>
      <div style={{margin: "auto", width: "100%", height: "auto", paddingBottom: "12px", fontSize: "0.825rem"}}>{text}</div>
      <p>
        <a
          href={`https://www.mintscan.io/kujira/tx/${txHash}`}
          target="_blank"
          className="custom-link"
          style={{color: "#f2284e"}}
        >
          {txHash? txHash.substring(0, 15) + "..." : ""}
        </a>
      </p>
      <br></br>
    </ReactModal>
  );
};

export default SomeOtherComponent;