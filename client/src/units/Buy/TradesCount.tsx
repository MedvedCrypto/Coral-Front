import React from 'react';

interface TraderProps {
  trades: number;
}

const TraderRang: React.FC<TraderProps> = ({ trades }) => {


  return (
    <div className="sellers-table__trader-trades">
    {" "}
    <span>{trades} </span>trades
  </div>
  );
};

export default TraderRang;