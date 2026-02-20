import { useState, useEffect } from 'react';
import ReactModal from "react-modal";
import "../../css/style2.css";

const ModalConfirm = () => {
    const [confirmed2, setConfirmed2] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Проверяем, было ли модальное окно уже открыто
        const hasSeenModal2 = localStorage.getItem('hasSeenModal2');
        if (!hasSeenModal2) {
            setIsVisible(true); // Показываем модальное окно, если пользователь не видел его
        }
    }, []);

    const handleRequestClose = () => {
        setIsVisible(false);
        setConfirmed2(false);
        // Сохраняем в localStorage, что пользователь видел модальное окно
        localStorage.setItem('hasSeenModal2', 'true');
    };

    return (
        <ReactModal
            isOpen={isVisible}
            shouldCloseOnOverlayClick={true}
            ariaHideApp={false}
            style={{
                overlay: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: "2147483646",
                    backgroundColor: "rgba(0, 0, 0, 0.8)" // Полупрозрачный фон
                },
                content: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    border: "0px",
                    backgroundColor: "#19191c",
                    color: "#fff",
                    WebkitOverflowScrolling: "touch",
                    outline: "none",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    height: "fit-content",
                    width: "fit-content",
                    maxWidth: "70vw",
                    margin: "auto"
                },
            }}
        >
            <div>
                This protocol operates without requiring Know Your Customer (KYC) procedures, however it is strictly prohibited to use this protocol for any illicit activities, including but not limited to money laundering, fraud, or the transfer of funds derived from criminal activities. 
                We reserve the right to take necessary actions, including blocking or freezing funds, in cases where misuse or illegal activity is detected. 
                <br></br>
                <br></br>
                The team shall not be held liable for any misuse of the protocol by users, but we remain dedicated to fostering a secure and transparent ecosystem for all participants.
                By proceeding, you confirm that you are not engaging in any illegal activities and that all funds used in connection with this protocol are derived from legitimate sources.
            </div>
            
            <div style={{ margin: "20px 0", fontSize: "1.5rem" }}>
                <label>
                    <input 
                        type="checkbox" 
                        checked={confirmed2} 
                        onChange={() => setConfirmed2(!confirmed2)} 
                    />
                    &nbsp; I've read it and I agree with everything
                </label>
            </div>

            <button 
                onClick={handleRequestClose} 
                disabled={!confirmed2} 
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    backgroundColor: "#f2284e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: confirmed2 ? "pointer" : "not-allowed"
                }}
            >
                Confirm
            </button>
        </ReactModal>
    );
};

export default ModalConfirm;
