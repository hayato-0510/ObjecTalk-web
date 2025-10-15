import React from 'react';
import type { ChatItem } from '../App';

interface ChatContainerProps {
  chatHistory: ChatItem[];
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ chatHistory, chatContainerRef }) => (
  <div id="chatContainer" ref={chatContainerRef}>
    {chatHistory.length === 0 && (
      <p style={{ fontStyle: 'italic', color: '#666' }}>「セッション開始」ボタンを押して、マイクに向かって話しかけてください。</p>
    )}
    {chatHistory.map((item: ChatItem) => (
      <p key={item.id} className="chat-message ai">
        {item.text}
      </p>
    ))}
  </div>
);

export default ChatContainer;
