import { createContext, ReactNode, useState } from 'react';

interface NftAmount_contType {
  nftAmount: number; 
  setNftAmount_cont: (nftAmount: number) => void; 
  collateralAmount: number, 
  setCollateralAmount_cont: (collateralAmount: number) => void; 
  currenProcent: number; 
  setCurrenProcent: (currenProcent: number) => void; 
}

const NftAmount_cont = createContext<NftAmount_contType>({
  nftAmount: 0, 
  setNftAmount_cont: () => {}, 
  collateralAmount: 0, 
  setCollateralAmount_cont: () => {}, 
  currenProcent: 0,
  setCurrenProcent: () => {}, 
});

interface TxHashProviderProps {
  children: ReactNode;
}

export const NFTAmountProvider = ({ children }: TxHashProviderProps) => {
  const [nftAmount, setNftAmount_cont] = useState(0); 
  const [collateralAmount, setCollateralAmount_cont] = useState(0); 
  const [currenProcent, setCurrenProcent] = useState(0); 


  return (
    <NftAmount_cont.Provider value={{ nftAmount, setNftAmount_cont, collateralAmount, setCollateralAmount_cont, currenProcent, setCurrenProcent }}>
      {children}
    </NftAmount_cont.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default NftAmount_cont;