import React from 'react';

interface ControlPanelProps {
  status: string;
  onStart: () => void;
  onStop: () => void;
  onClearEvents: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ status, onStart, onStop, onClearEvents }) => (
  <div style={{ marginBottom: '12px' }}>
    <button
      onClick={onStart}
      disabled={status === 'CONNECTING' || status === 'CONNECTED'}
      style={{ marginRight: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: status === 'CONNECTED' ? '#ccc' : '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
    >
      {status === 'CONNECTING' ? '接続中...' : 'セッション開始'}
    </button>
    <button
      onClick={onStop}
      disabled={status !== 'CONNECTED'}
      style={{ marginRight: '8px', padding: '8px 16px', borderRadius: '4px', backgroundColor: status !== 'CONNECTED' ? '#ccc' : '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
    >
      セッション停止
    </button>
    <button
      onClick={onClearEvents}
      style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
    >
      イベントカウントをクリア
    </button>
  </div>
);

export default ControlPanel;
