import React from 'react';

interface LogContainerProps {
  log: string[];
  status: string;
}

const LogContainer: React.FC<LogContainerProps> = ({ log, status }) => (
  <div className="log-container">
    {log.map((msg: string, index: number) => (
      <p key={index} style={{ margin: '4px 0', color: status === 'ERROR' && msg.includes('エラー') ? 'red' : 'inherit' }}>
        {msg}
      </p>
    ))}
  </div>
);

export default LogContainer;
