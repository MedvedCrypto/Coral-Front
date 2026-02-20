import React from 'react';

interface TraderRangProps {
  percent: number;
}

const TraderRang: React.FC<TraderRangProps> = ({ percent }) => {
  let color = '#90EE90';

  if (percent < 75) {
    color = 'red';
  } else if (percent < 90) {
    color = 'yellow';
  }

  return (
    // <div className="sellers-table__trader-rang" style={{ color }}>
    //   Rang<span>{percent}% </span>
    // </div>
    <>
    </>
  );
};

export default TraderRang;