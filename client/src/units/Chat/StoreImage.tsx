import React, { useState } from "react";
import {
  btnAllowToReadImages,
  btnSendMsg,
  btnUploadImage,
  queryLastImageId,
} from "../buttons/btnLend";
import './FileUpload.css';

// Предположим, что эти функции уже определены где-то в вашем коде
const toBase64 = (image) => {
  // Конвертация Uint8Array в Base64
  return btoa(String.fromCharCode(...image));
};

const queryTimestamp = async () => {
  // Здесь должен быть ваш код для запроса временной метки
  return Date.now(); // Пример возврата текущей временной метки
};

const serializeEncrypt = (encKey, timestamp, imageItem) => {
  // Здесь должен быть ваш код для сериализации и шифрования
  return { value: `${encKey}-${timestamp}-${imageItem.image}` }; // Пример
};

const _msgWrapperWithGasPrice = async (messages, gasPrice) => {
  // Здесь ваш код для обработки сообщений с учетом цены газа
  console.log("Messages:", messages, "Gas Price:", gasPrice);
  return Promise.resolve(); // Пример
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ваш компонент
const ImageUploader = ({ encKey, receiver, owner }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    const imageArray = new Uint8Array(image); // Преобразование изображения в Uint8Array
    const id = Number(await queryLastImageId(encKey)) +1;

    // const id = 1

    try {
      console.log(id)
      const res = await btnUploadImage(encKey, imageArray, id);
      console.log(res)

      await delay(1500);

      const lastImageId = Number(await queryLastImageId(encKey));
      console.log(lastImageId);
      const res2 = await btnAllowToReadImages(
        encKey,
        [lastImageId],
        [receiver, owner]
      );
      console.log(res2);
      const sendMsgImage = await btnSendMsg(
        encKey,
        receiver,
        `{\"openImg\": ${lastImageId}}`
      );
      console.log(sendMsgImage);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(new Uint8Array(event.target.result));
      setPreview(URL.createObjectURL(file)); // Создание URL для предварительного просмотра
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <div className="file-upload">
        <label htmlFor="file-upload" className="file-upload-label">
          Select Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-upload-input"
        />
      </div>
      {preview && (
        <div className="rrr">
          <img
            src={preview}
            alt="Image Preview"
            style={{ maxWidth: "100px", maxHeight: "100px" }}
          />
        </div>
      )}
      {image&&<div className="sendImage" onClick={handleUpload}><span>Send Image</span></div>}
    </div>
  );
};

export default ImageUploader;
