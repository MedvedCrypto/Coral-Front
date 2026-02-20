import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import useWalletAddress from "./hooks/useWalletAddress.tsx";
import Lend from "./units/Lend.tsx";
import MainPage from "./units/mainPage.tsx";
import MyOffers from "./units/MyOffers/MyOffers.tsx";
import Trade from "./units/Offer/Trade.tsx";
import Chat from "./units/Chat/Chat.tsx";
import TradesList from "./units/Offer/openTrades.tsx";
import sprite from "./images/sprite.svg";

import HeaderSiteDesktop from "./units/Header.tsx";
import { TxHashProvider } from "./units/context/txHash.tsx";
import { RPCProvider } from "./units/context/RPC.tsx";
import Modl2 from "./units/Modl2/Modl2.tsx";
import ModlFAQ from "./units/Modl2/ModlFAQ.tsx";


import { QueryClient, QueryClientProvider } from "react-query";
import { useEffect } from "react";

const queryClient = new QueryClient();


const App = () => {
  const [ownerAddr, walletName, btnConnect, walletSigner, disconnectWallet] =
    useWalletAddress();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TxHashProvider>
          <RPCProvider>
            <HeaderSiteDesktop
              onConnect={btnConnect}
              disconnectWallet={disconnectWallet}
              walletName={walletName}
              walletAddress={ownerAddr}
            />
            <Modl2 />
            <ModlFAQ />
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/market" element={<Lend ownerAddr={ownerAddr} walletSigner={walletSigner}/>} />
              <Route path="/my-offers" element={<MyOffers ownerAddr={ownerAddr} walletSigner={walletSigner}/>} />
              <Route path="/my-trades" element={<TradesList ownerAddr={ownerAddr} walletSigner={walletSigner}/>} />
              <Route path="/trade/:paramTradeId?" element={<Trade ownerAddr={ownerAddr} walletSigner={walletSigner}/>} />
              <Route path="/chat/:address" element={<Chat ownerAddr={ownerAddr} />} />
            </Routes>
            <footer className="footer">
          <div className="container">
            <div className="footer__inner">
              <div className="social">
                <ul>
                  <li>
                    {" "}
                    <a href="#">
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#twitter`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li>
                    {" "}
                    <a href="#">
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#discord`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li>
                    {" "}
                    <a href="#">
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#github`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li>
                    {" "}
                    <a href="#">
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#medium`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                  <li>
                    {" "}
                    <a href="#">
                      <div className="icon">
                        <svg>
                          <use xlinkHref={`${sprite}#tokenomika`} />
                        </svg>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer__links">
            {" "}
            <a className="footer__links-item" href="/market">
              Market
            </a>
            <a className="footer__links-item" href="/my-trades">
              My Open Trades
            </a>
            <a className="footer__links-item" href="/my-offers">
              My Offers
            </a>
          </div>
        </footer>
          </RPCProvider>
        </TxHashProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
