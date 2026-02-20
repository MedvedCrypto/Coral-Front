import { createContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

interface TxHashContextType {
  txHash: string;
  setTxHash: Dispatch<SetStateAction<string>>;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}

const TxHashContext = createContext<TxHashContextType>({
  txHash: '',
  setTxHash: () => {},
  text: '',
  setText: () => {},
});

interface TxHashProviderProps {
  children: ReactNode;
}

export const TxHashProvider = ({ children }: TxHashProviderProps) => {
  const [txHash, setTxHash] = useState('');
  const [text, setText] = useState('');

  console.log(txHash, text);

  return (
    <TxHashContext.Provider value={{ txHash, setTxHash, text, setText }}>
      {children}
    </TxHashContext.Provider>
  );
};

export default TxHashContext;