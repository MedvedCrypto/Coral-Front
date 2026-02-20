import React, { useEffect, useState } from 'react';
import { queryImage } from '../buttons/btnLend';



const Chat: React.FC<{ chat: Array<{ message: any; sender: string }>; ownerId: string; encKey: string; receiver: string; }> = ({ chat, ownerId, encKey, receiver }) => {
  const [images, setImages] = useState<{ [key: number]: string }>({});

  const fnqueryImage = async (key: string, imageId:number, owner: string, receiver: string) => {
    const img = await queryImage(key, imageId, owner, receiver)
    // console.log(img)
    const blob = new Blob([img], { type: 'image/jpeg' }); // Укажите правильный тип изображения
const imageUrl = URL.createObjectURL(blob); 
    return imageUrl
  };

  useEffect(() => {
    const fetchImages = async () => {
      for (const msg of chat) {
        try {
          // Проверяем, является ли сообщение строкой и пытаемся его распарсить
          const parsedMessage = typeof msg.message === 'string' ? JSON.parse(msg.message) : msg.message;

          console.log(parsedMessage)
    
          if (parsedMessage.openImg !== undefined) {
            const imageId = parsedMessage.openImg; 
            console.log(imageId);
            
            const base64Image = await fnqueryImage(encKey, imageId, msg.sender, ownerId); 
            setImages(prevImages => ({ ...prevImages, [imageId]: base64Image }));
          }
        } catch (error) {
          // console.error('Ошибка при обработке сообщения:', error);
          // Здесь можно добавить дополнительную логику обработки ошибок, если нужно
        }
      }
    };
    

    fetchImages();
  }, [chat, encKey, ownerId, receiver]);

  return (
    <div style={styles.chatContainer}>
      {chat.map((msg, index) => (
        <div
          key={index}
          style={{ ...styles.message, ...(msg.sender === ownerId ? styles.owner : styles.other) }}
        >
          {(() => {
            try {
              const parsedMessage = JSON.parse(msg.message);
              // Проверяем, есть ли openImg в разобранном сообщении
              if (parsedMessage.openImg !== undefined) {
                return (
                  <img
                    src={images[parsedMessage.openImg]}
                    alt={`Image ${parsedMessage.openImg}`}
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                );
              }
              return parsedMessage; // Возвращаем разобранное сообщение, если оно валидно
            } catch (e) {
              // Если JSON.parse вызвал ошибку, возвращаем исходное сообщение
              return msg.message;
            }
          })()}
        </div>
      ))}
    </div>
  );
  
};

const styles = {
  chatContainer: {
              maxWidth: "600px",
              width: "90%",
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      overflowY: 'auto',
      maxHeight: '400px', // Ограничение высоты для скролла
      backgroundColor: "black"
  },
  message: {
      marginBottom: '10px',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '80%',
      clear: 'both',
  },
  owner: {
      backgroundColor: '#dcf8c6', // Цвет для сообщений владельца
      float: 'right',
      textAlign: 'right',
      color: "black"
  },
  other: {
      backgroundColor: '#ffffff', // Цвет для сообщений других пользователей
      float: 'left',
      textAlign: 'left',
      color: "black"
  }
};

export default Chat;
