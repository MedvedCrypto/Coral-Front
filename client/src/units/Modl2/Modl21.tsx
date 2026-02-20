import { useContext, useEffect, useState } from 'react';
import TxHashContext from '../context/txHash';
import ReactModal from "react-modal";

const SomeOtherComponent = () => {
  const { txHash, text } = useContext(TxHashContext);
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
          width: "200px",
          height: "100px",
          marginLeft: "auto",
          marginTop: "40px",
          marginRight: "40px",
          zIndex: "99999",
          borderRadius: "4px",
          animation: "blink 1s infinite"
        },
        content: {
          position: "absolute",
          top: "2px",
          left: "2px",
          right: "2px",
          bottom: "2px",
          border: "0px",
          backgroundColor: "rgb(45 45 45)",
          color: "#fff",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          borderRadius: "4px",
          outline: "none",
          padding: "15px",
        },
      }}
    >
      <div>{text}</div>
      <p>
        <a
          href={`https://www.mintscan.io/stargaze/tx/${txHash}`}
          target="_blank"
          className="custom-link"
        >
          {txHash}
        </a>
      </p>
    </ReactModal>
  );
};

export default SomeOtherComponent;