import { useState, useEffect /*ChangeEvent, FormEvent*/ } from "react";
import "../css/style2.css";
import styles from "../css/header.module.css";
import WalletModalStyles from "../css/WalletModal.module.css";
import $ from "jquery"; // Импортируем jQuery

import ModlHelp from "./Modl2/ModlHelp";

import logo from "../images/src/logo.svg";

import sprite from "../images/sprite.svg";
import { useLocation } from "react-router-dom";

interface Wallet {
  name: string;
  icon: string;
}

const wallets: Wallet[] = [
  {
    name: "Keplr",
    icon: "https://raw.githubusercontent.com/cosmology-tech/cosmos-kit/dd6127a36dbf5c5e4c4e4cc0c5f50d3ee353e8de/public/images/logos/wallets/keplr.svg",
  },
  // {
  //   name: "Cosmostation",
  //   icon: "https://github.com/cosmology-tech/cosmos-kit/blob/main/public/images/logos/wallets/cosmostation.png?raw=true",
  // },
  {
    name: "Leap",
    icon: "https://github.com/cosmology-tech/cosmos-kit/blob/main/public/images/logos/wallets/leap.png?raw=true",
  },
  {
    name: "Vultisig",
    icon: "https://docs.vultisig.com/~gitbook/image?url=https%3A%2F%2F3933991992-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F9DZGgfTk0iCBHrjWyV7A%252Ficon%252FO4J6qJMxXbY3MQymX7QE%252F256%2520x%2520256voltix-icon.png%3Falt%3Dmedia%26token%3D0b0babdb-1a7a-4b33-a6b4-010415259a92&width=32&dpr=2&quality=100&sign=f8085dea&sv=1",
  },
  // { name: 'OKX Wallet', icon: '⬛' },
  // { name: 'Osmosis', icon: '🧪' },
];

const HeaderSite: React.FC = ({
  onConnect,
  disconnectWallet,
  walletName,
  walletAddress,
}) => {
  const location = useLocation();
  const [connectBtnText, setConnectBtnText] = useState("connect");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Обработчик для клика на элемент с классом .offer-popup-js
    const handleOfferPopupClick = (e) => {
      e.preventDefault();
      $(".popup-js").addClass("active");
      $("body").addClass("no-scroll");
    };

    // Обработчик для клика на элемент с классом .popup-cancel-js
    const handlePopupCancelClick = () => {
      $(".popup-js").removeClass("active");
      $("body").removeClass("no-scroll");
    };

    // Обработчик для клика на элемент с классом .my-offers-edit-js
    const handleMyOffersEditClick = function () {
      const $currentOfferItem = $(this).parents(".my-offers__item");
      $currentOfferItem.find(".edit-js").slideDown();
      $currentOfferItem.find(".my-offers__item-inner-wrap").addClass("hide");

      $(".edit-js").not($currentOfferItem.find(".edit-js")).slideUp();
      $(".my-offers__item-inner-wrap")
        .not($currentOfferItem.find(".my-offers__item-inner-wrap"))
        .removeClass("hide");
    };

    // Обработчик для клика на элемент с классом .my-offers-edit-cancel-js
    const handleMyOffersEditCancelClick = function () {
      const $currentOfferItem = $(this).parents(".my-offers__item");
      $currentOfferItem.find(".edit-js").slideUp();
      $currentOfferItem.find(".my-offers__item-inner-wrap").removeClass("hide");
    };

    // Привязываем обработчики событий
    $(".offer-popup-js").on("click", handleOfferPopupClick);
    $(".popup-cancel-js").on("click", handlePopupCancelClick);
    $(".my-offers-edit-js").on("click", handleMyOffersEditClick);
    $(".my-offers-edit-cancel-js").on("click", handleMyOffersEditCancelClick);

    // Очистка обработчиков событий при размонтировании компонента
    return () => {
      $(".offer-popup-js").off("click", handleOfferPopupClick);
      $(".popup-cancel-js").off("click", handlePopupCancelClick);
      $(".my-offers-edit-js").off("click", handleMyOffersEditClick);
      $(".my-offers-edit-cancel-js").off(
        "click",
        handleMyOffersEditCancelClick
      );
    };
  }, []);

  useEffect(() => {
    const isConnected = localStorage.getItem("connect");
    if (isConnected === "true") {
      onConnect();
      setConnectBtnText(
        `${walletAddress.substring(5, 10)}...${walletAddress.slice(-4)}`
      );
    }
  }, []);

  const [showModal, setShowModal] = useState(false);

  const btnConnect = async (walletType: string) => {
    if (walletType === "Leap") {
      localStorage.setItem("wallet", "leap");
    } else if (walletType === "Keplr") {
      localStorage.setItem("wallet", "keplr");
    } else {
      localStorage.setItem("wallet", "Vultisig");
    }
    onConnect();
  };

  useEffect(() => {
    if (localStorage.getItem("connect") === "true") {
      setConnectBtnText(
        `${walletAddress.substring(5, 10)}...${walletAddress.slice(-4)}`
      );
      setShowModal(false);
    } else if (localStorage.getItem("connect") === "false") {
      setConnectBtnText("connect");
      setShowModal(false);
    }
  }, [walletName, walletAddress]);

  const handleDisconnectWallet = async () => {
    localStorage.setItem("connect", "false");
    setTimeout(async () => {
      await disconnectWallet();
      setShowModal(false);
    }, 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const isTradePage = location.pathname.startsWith("/trade/");

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Сброс состояния через 2 секунды
    } catch (err) {
      console.error("Ошибка при копировании: ", err);
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <div className="header__col">
              <a className="header__logo" href="/">
                <img src={logo} alt="" />
              </a>
              {/* <p>{""}</p> */}
            </div>
            {/* {location.pathname !== "/" && (
              <>
                <a href={isTradePage ? "/my-trades" : "/"}>
                  <svg
                    style={{
                      width: "128px",
                      height: "70px",
                      position: "absolute",
                      top: "42px",
                      left: "-28px",
                    }}
                    width="128"
                    height="128"
                    viewBox="0 0 64 64"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M15.5429 32.4571C15.1524 32.0666 15.1524 31.4334 15.5429 31.0429L21.9069 24.6789C22.2974 24.2884 22.9305 24.2884 23.3211 24.6789C23.7116 25.0694 23.7116 25.7026 23.3211 26.0931L18.6642 30.75H37.75C38.3023 30.75 38.75 31.1977 38.75 31.75C38.75 32.3023 38.3023 32.75 37.75 32.75H18.6642L23.3211 37.4068C23.7116 37.7974 23.7116 38.4305 23.3211 38.8211C22.9305 39.2116 22.2974 39.2116 21.9069 38.8211L15.5429 32.4571Z"
                      fill="white"
                    />
                  </svg>
                </a>
              </>
            )} */}
            <div className="header__col">
              <div className="notification">
                <div className="notification__inner notification-js">
                  {/* <div className="notification__count">1</div> */}
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#notification`} />
                    </svg>
                  </div>
                </div>
                <div className="notification__dropdown">
                  <div className="notification__dropdown-top">
                    <div className="notification__dropdown-top-inner">
                      <div className="notification__title">Notifications</div>
                      <a className="notification__mark" href="#">
                        Mark all as read{" "}
                      </a>
                    </div>
                  </div>
                  {/* <div className="notification__list scroll-js">
                    
                    <a className="notification__item" href="#">
                      <div className="notification__item-col">
                        <div className="icon">
                          <svg>
                            <use xlinkHref={`${sprite}#info`} />
                          </svg>
                        </div>
                        <div>
                          <div className="notification__item-label">
                            Trade finished successfully
                          </div>
                          <div className="notification__item-sublabel">
                            with username
                          </div>
                        </div>
                      </div>
                      <div className="notification__item-col">
                        <div className="notification__item-time">20m ago</div>
                      </div>
                    </a>

                  </div> */}
                </div>
              </div>
              <div className="header__btn-wrap">
                <a className="btn btn_bordered" href="/market">
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#market`} />
                    </svg>
                  </div>
                  <span>Market</span>
                </a>
                <a className="btn btn_bordered" href="/my-trades">
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#hashtag`} />
                    </svg>
                  </div>
                  <span>My Open Trades</span>
                </a>
                <a className="btn btn_bordered" href="/my-offers">
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#history`} />
                    </svg>
                  </div>
                  <span>My offers</span>
                </a>
                <a
                  className="btn btn_accent btn_connect"
                  onClick={() => {
                    handleOpenModal();
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#log`} />
                    </svg>
                  </div>
                  <div className="icon">
                    <svg>
                      <use xlinkHref={`${sprite}#log2`} />
                    </svg>
                  </div>
                  <span>
                    <div>
                      {connectBtnText === "connect" ? (
                        <>
                          <div className={styles.walletProfileTextConnect}>
                            <div>Connect</div>
                          </div>
                        </>
                      ) : (
                        <>{connectBtnText}</>
                      )}
                    </div>
                  </span>
                </a>
                {showModal && (
                  <div className={`${WalletModalStyles.modal}`}>
                    <div className={` ${WalletModalStyles.modalContent}`}>
                      <button
                        className={`${WalletModalStyles.closeButton}`}
                        onClick={handleCloseModal}
                      >
                        <span>&#10006;</span>
                      </button>{" "}
                      {connectBtnText === "connect" ? (
                        <>
                          <div className={WalletModalStyles.walletItemContVerh}>
                            <br></br>
                            <div
                              className={
                                WalletModalStyles.SelectWalletToConnect
                              }
                              style={{
                                marginTop: "12px",
                                marginBottom: "0px",
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  marginLeft: 24,
                                  marginRight: 24,
                                  fontSize: "1.5rem",
                                }}
                              >
                                Select wallet to connect
                              </span>
                            </div>
                            <br></br>
                            <div
                              className={`${WalletModalStyles.walletsContainer}`}
                            ></div>
                          </div>
                          {wallets.map((wallet) => (
                            <div
                              key={wallet.name}
                              className={`${WalletModalStyles.walletItem2}`}
                              onClick={() => {
                                btnConnect(wallet.name);
                              }}
                            >
                              <div
                                className={`${WalletModalStyles.iconContainer}`}
                              >
                                <img src={`${wallet.icon}`} alt={wallet.name} />
                              </div>
                              <div
                                className={`${WalletModalStyles.walletName}`}
                              >
                                {wallet.name}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div
                          className={`${WalletModalStyles.walletsContainer}`}
                        >
                          <div className={WalletModalStyles.walletItemContVerh}>
                            <div
                              style={{
                                marginTop: "24px",
                                marginBottom: "36px",
                                paddingTop: "-24px",
                              }}
                            >
                              <span
                                className={styles.stars}
                                style={{
                                  marginTop: "24px",
                                  marginBottom: "24px",
                                }}
                              >
                                Your account:
                              </span>
                              <span
                                style={{
                                  fontWeight: "600",
                                  marginLeft: "64px",
                                }}
                              >
                                {walletAddress.substring(5, 10)}...
                                {walletAddress.slice(-4)}
                                <span onClick={handleCopy}>
                                {copied ? (
                                  <span                     style={{width: 16, position: "relative", top: 0, left: 3, cursor: "pointer"}}>✅</span>
                                ) : (
                                  <svg
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    style={{width: 16, position: "relative", top: 3, left: 3, cursor: "pointer"}}
                                  >
                                    <path
                                      fill="#fff"
                                      fill-rule="evenodd"
                                      d="M4 2a2 2 0 00-2 2v9a2 2 0 002 2h2v2a2 2 0 002 2h9a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H4zm9 4V4H4v9h2V8a2 2 0 012-2h5zM8 8h9v9H8V8z"
                                    ></path>
                                  </svg>
                                )}
                              </span>
                              </span>

                            </div>
                          </div>
                          <br></br>
                          <div className={WalletModalStyles.walletItemCont}>
                            <div
                              className={`${WalletModalStyles.walletItem}`}
                              onClick={() => {
                                handleDisconnectWallet();
                              }}
                            >
                              <svg
                                style={{ marginRight: 12 }}
                                fill={"#f2284e"}
                                height={17}
                                width={17}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                              >
                                <path d="M320 32c0-9.9-4.5-19.2-12.3-25.2S289.8-1.4 280.2 1l-179.9 45C79 51.3 64 70.5 64 92.5L64 448l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 192 0 32 0 0-32 0-448zM256 256c0 17.7-10.7 32-24 32s-24-14.3-24-32s10.7-32 24-32s24 14.3 24 32zm96-128l96 0 0 352c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-320c0-35.3-28.7-64-64-64l-96 0 0 64z" />
                              </svg>
                              Disconnect
                            </div>
                          </div>
                        </div>
                      )}{" "}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderSite;
