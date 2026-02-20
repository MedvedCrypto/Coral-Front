import { createContext, useEffect, useState } from 'react';

interface RPCContextType {
  rpc: string;
  setRPC: (rpc: string) => void;
}

const RPCContext = createContext<RPCContextType>({
  rpc: '',
  setRPC: () => {},
});

export const RPCProvider = ({ children }) => {
  const [rpc, setRPC] = useState('https://rpc.elgafar-1.stargaze-apis.com');

  useEffect(() => {
    if(localStorage.getItem('selectedRPC')){
      setRPC(localStorage.getItem('selectedRPC'))
    }
},[])
  

  return (
    <RPCContext.Provider value={{ rpc, setRPC }}>
      {children}
    </RPCContext.Provider>
  );
};

export default RPCContext;