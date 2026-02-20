import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SamChat from "./SamChat.tsx";
import ImageUploader from "./StoreImage.tsx";
import './FileUpload.css';
import {
  btnAllowToRead,
  btnGenerate,
  btnSendMsg,
  queryChat,
  queryEncKey,
  btnRemoveBindingHash,
} from "../buttons/btnLend";

import TxHashContext from "./../context/txHash.tsx";

const Chat: React.FC = ({ ownerAddr }) => {
  const { address } = useParams();
  const { txHash, setTxHash, setText } = useContext(TxHashContext);
  const [key, setKey] = useState(undefined);
  // const [receiver, setReceiver] = useState(() => {
  //   // Инициализируем состояние из localStorage, если оно существует
  //   const savedReceiver = localStorage.getItem('receiver');
  //   return savedReceiver ? JSON.parse(savedReceiver) : undefined;
  // });
  const [receiver, setReceiver] = useState(address);

  // const [key, setKey] = useState(
  //   "dd4c54548b28438a3ab346d86689d1d9b628baf0d665338de7f247a94d430a77"
  // );

  // const [receiver, setReceiver] = useState(
  //   "kujira133xakkrfksq39wxy575unve2nyehg5npnflfk6"
  // );

  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState(undefined);

  const generateHash = async () => {
    const createKey = await btnGenerate(); // Предполагается, что btnGenerate возвращает промис
    console.log(createKey); // Если createKey - это асинхронная функция
    btnRemoveBindingHash(createKey.bindingHash);
    setKey(createKey.encKey);
  };

  const SendMsg = async () => {
    const createKey = await btnSendMsg(key, receiver, msg); // Предполагается, что btnGenerate возвращает промис
    console.log(createKey); // Если createKey - это асинхронная функция
  };

  const AllowToRead = async () => {
    const createKey = await btnAllowToRead();
    console.log(createKey);
  };

  const fnqueryChat = async () => {
    if (key && receiver) {
      const res = await queryChat(receiver, key);
      return res;
    } else {
      return [];
    }
  };

  const fnqueryEncKey = async () => {
    const createKey = await queryEncKey();
    console.log(createKey);
  };

  useEffect(() => {
    const fetchChat = async () => {
      const chatData = await fnqueryChat();
      console.log(chatData);
      setChat(chatData);
    };

    if (key && receiver) {
      fetchChat(); // Первоначальный вызов для загрузки чата

      // Устанавливаем интервал для обновления каждые 10 секунд
      const intervalId = setInterval(fetchChat, 5000);

      // Очистка интервала при размонтировании компонента
      return () => clearInterval(intervalId);
    }
  }, [key, receiver, txHash]);

  useEffect(() => {
    // Сохраняем receiver в localStorage при его изменении
    if (receiver !== undefined) {
      localStorage.setItem('receiver', JSON.stringify(receiver));
    } else {
      // Если receiver undefined, удаляем из localStorage
      localStorage.removeItem('receiver');
    }
  }, [receiver]);

  return (
    <div className="sellers-table__tr seller-tr-js" style={{ color: "white", width: "fit-content", marginLeft: "auto", marginRight: "auto", minWidth: "40%", display: "flex", alignItems: "center", flexDirection: "column" }}>



                <div className="steps__text">
                  <p>
                  Please save the Secret key if you don't want to generate a new one next time
                  </p>
                </div>

      {/* <div onClick={AllowToRead}>AllowToRead</div> */}
      {/* <div onClick={fnqueryChat}>fnqueryChat</div> */}
      {/* <div onClick={fnqueryEncKey}>queryEncKey</div> */}

      <br></br>
      <br></br>

      <div className="popup__col-wrap" style={{maxWidth: 500, width: "90%"}}>
        <div className="popup__col popup__col_full">
          <div className="input">
            <label style={{alignItems: "center"}} htmlFor="telegram">Your secret key       <div style={{marginLeft: 24}} className="header__btn-wrap">
                <a className="btn btn_bordered" onClick={generateHash}>
                  <span>Generate Key 🤫🤐</span>
                </a>
                </div></label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              placeholder="cfghjkdxlfcm54nto745ntdyt5dnt5tDaeva34fdx....."
            />
          </div>
        </div>
      </div>
      <div className="popup__col-wrap" style={{maxWidth: 500, width: "90%"}}>
        <div className="popup__col popup__col_full">
          <div className="input">
            <label htmlFor="telegram">Your interlocutor</label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
              placeholder="kujira1hvp..."
            />
          </div>
        </div>
      </div>

      {key && receiver && (
        <>
          <SamChat
            chat={chat}
            ownerId={ownerAddr}
            encKey={key}
            receiver={receiver}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              maxWidth: "600px",
              width: "90%"
            }}
          >
            <div>
              <div className="input inputMSG">
                <textarea
                  id="telegram"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                  placeholder="Write a text for the interlocutor here"
                  rows={4} // Устанавливаем высоту текстового поля
                />
              </div>
              <div className="sendMsgBtn" onClick={SendMsg}><span>Send Msg</span></div>
            </div>

            <ImageUploader owner={ownerAddr} receiver={receiver} encKey={key} />
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
