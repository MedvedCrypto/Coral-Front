import React, { useCallback, useContext, useEffect, useState } from "react";

import "../css/style.css";


const MainPage: React.FC = () => {




  return (
    <body>
      <div className="wrapper">
        <div className="content">
          
          <div className="hero">
            <div className="container">
              <div className="hero__inner" style={{display: "flex", alignItems: "center"}}>
                <div>
                  <div
                    className="title title_centered title_h1"
                    data-aos="fade-down"
                  >
                    A Sea of Offers <br /> Awaits
                    <div className="title__backlight backlight-js">
                      <span>You</span>
                    </div>
                  </div>
                  <div
                    className="subtitle subtitle_centered"
                    data-aos="fade-down"
                    data-aos-delay={300}
                  >
                    <span>Coral </span>empowers P2P trading making it easier for{" "}
                    <span>
                      you <br />
                    </span>
                    to onboard into the crypto world{" "}
                  </div>
                </div>
                <div
                  className="hero__img"
                  data-aos="zoom-in"
                  data-aos-delay={600}
                >
                  <img src="../images/dist/hero.svg" alt="" />
                </div>
              </div>
            </div>
          </div>
    
        </div>
      </div>
    </body>
  );
};

export default MainPage;
