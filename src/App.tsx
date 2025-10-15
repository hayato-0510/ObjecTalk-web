import { useEffect, useRef, useReducer, useCallback } from 'react';
import ChatContainer from './components/ChatContainer';
import LogContainer from './components/LogContainer';
import ControlPanel from './components/ControlPanel';
import EventCounterPanel from './components/EventCounterPanel';

// --- 型定義 ---
type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface ChatItem {
  id: string;
  text: string;
  role: 'ai';
}

interface SessionState {
  status: SessionStatus;
  log: string[];
  chatHistory: ChatItem[];
  eventCounts: Map<string, number>;
}

type SessionAction =
  | { type: 'SET_STATUS'; payload: SessionStatus }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'CLEAR_LOG' }
  | { type: 'CLEAR_CHAT' }
  | { type: 'INCREMENT_EVENT'; payload: { name: string } }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'START_AI_RESPONSE'; payload: { itemId: string } }
  | { type: 'UPDATE_AI_RESPONSE'; payload: { itemId: string; deltaText: string } }
  | { type: 'FINALIZE_AI_RESPONSE'; payload: { itemId: string } };

// --- 初期状態と定数 ---
const BACKEND_URL = 'http://localhost:3001/api/sdp';
const INITIAL_STATE: SessionState = {
  status: 'DISCONNECTED',
  log: [],
  chatHistory: [],
  eventCounts: new Map(),
};

// --- Reducer (状態管理ロジック) ---
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_LOG':
      return { ...state, log: [...state.log, action.payload] };
    case 'CLEAR_LOG':
      return { ...state, log: [] };
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };
    case 'INCREMENT_EVENT': {
      const { name } = action.payload;
      const newCounts = new Map(state.eventCounts);
      const currentCount = newCounts.get(name) ?? 0;
      newCounts.set(name, currentCount + 1);
      return { ...state, eventCounts: newCounts };
    }
    case 'CLEAR_EVENTS':
      return { ...state, eventCounts: new Map() };
    case 'START_AI_RESPONSE': {
      // 新しい会話項目を作成
      return {
        ...state,
        chatHistory: [...state.chatHistory, { id: action.payload.itemId, text: 'AI: ', role: 'ai' }],
      };
    }
    case 'UPDATE_AI_RESPONSE': {
      const { itemId, deltaText } = action.payload;
      return {
        ...state,
        chatHistory: state.chatHistory.map((item: ChatItem) =>
          item.id === itemId ? { ...item, text: item.text + deltaText } : item
        ),
      };
    }
    case 'FINALIZE_AI_RESPONSE': {
      // 確定したら、trimするなどの最終処理を行う
      return {
        ...state,
        chatHistory: state.chatHistory.map((item: ChatItem) =>
          item.id === action.payload.itemId ? { ...item, text: item.text.trim() } : item
        ),
      };
    }
    default:
      return state;
  }
}

// ----------------------------------------------------
// メインコンポーネント
// ----------------------------------------------------
const App = () => {
  const [state, dispatch] = useReducer(sessionReducer, INITIAL_STATE);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Utility Functions ---
  const log = useCallback((msg: string) => {
    console.log(`[LOG] ${msg}`);
    dispatch({ type: 'ADD_LOG', payload: msg });
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // チャットが更新されたらスクロール
    scrollToBottom();
  }, [state.chatHistory]);

  // --- Session Control Functions ---

  const stopSession = useCallback(() => {
    if (dcRef.current) { dcRef.current.close(); dcRef.current = null; }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      document.body.removeChild(audioRef.current);
      audioRef.current = null;
    }
    log("セッションを終了しました。");
    dispatch({ type: 'SET_STATUS', payload: 'DISCONNECTED' });
  }, [log]);

  const startSession = async () => {
    if (state.status !== 'DISCONNECTED') return;

    dispatch({ type: 'SET_STATUS', payload: 'CONNECTING' });
    dispatch({ type: 'CLEAR_LOG' });
    dispatch({ type: 'CLEAR_CHAT' });
    dispatch({ type: 'CLEAR_EVENTS' }); // Start fresh count

    try {
      // 1. WebRTC接続を作成
      pcRef.current = new RTCPeerConnection();
      const pc = pcRef.current;
      
      // 2. Audio Elementの準備
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
      audioRef.current = audioEl;

      // リモート音声を受け取ったらaudioにセット
      pc.ontrack = (event: RTCTrackEvent) => {
        audioEl.srcObject = event.streams[0];
        console.log("🎧 Remote audio track received");
      };

      // 3. マイク入力を取得して送信
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => pc.addTrack(track, micStream));
      log("🎤 マイク入力を取得しました。");

      // 4. DataChannelを作成（AIからのイベント受信用）
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        log("✅ データチャネルが開きました。セッション開始。");
        dispatch({ type: 'SET_STATUS', payload: 'CONNECTED' });
      };

      dc.onclose = () => {
        if (state.status === 'CONNECTED') {
          log("⚠️ データチャネルが閉じられました。");
        }
        stopSession();
      };
      
      // 5. DataChannelメッセージ処理
      dc.onmessage = (evt: MessageEvent) => {
        const msg = JSON.parse(evt.data);
        const eventName = msg && msg.type ? String(msg.type) : "unknown";
        dispatch({ type: 'INCREMENT_EVENT', payload: { name: eventName } });

        /* --- 会話表示ロジック --- */
        const itemId = msg.item_id || (msg.item && msg.item.id);

        // 1) conversation.item.created → 表示用の要素を準備
        if (msg.type === "conversation.item.created" && itemId) {
          dispatch({ type: 'START_AI_RESPONSE', payload: { itemId } });
        }

        // 2) response.audio_transcript.delta → 途中の文字列を受信
        if (msg.type === "response.audio_transcript.delta" && itemId) {
          const deltaText = msg.delta || msg.text || "";
          if (deltaText) {
            dispatch({ type: 'UPDATE_AI_RESPONSE', payload: { itemId, deltaText } });
          }
        }

        // 3) response.audio_transcript.done → 確定処理
        if (msg.type === "response.audio_transcript.done" && itemId) {
          dispatch({ type: 'FINALIZE_AI_RESPONSE', payload: { itemId } });
        }
      };

      // 6. SDPを使ったWebRTCハンドシェイク
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Node.jsバックエンドにOfferを送信
      const sdpResponse = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp
      });
      
      if (!sdpResponse.ok) {
        throw new Error(`Backend error: ${sdpResponse.status} ${await sdpResponse.text()}`);
      }

      const sdpAnswer = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = { type: "answer", sdp: sdpAnswer };
      await pc.setRemoteDescription(answer);
      log("🎤 セッション開始信号を確立しました。");

    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      log(`エラーが発生しました: ${errorMessage}`);
      dispatch({ type: 'SET_STATUS', payload: 'ERROR' });
      stopSession(); // エラー時は強制終了
    }
  };

  const handleClearEvents = () => {
    dispatch({ type: 'CLEAR_EVENTS' });
  };

  // --- Component Rendering ---
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: '12px' }}>
      <style>{`
        /* Tailwindは使用せず、元のHTMLのスタイルを再現 */
        #chatContainer {
          max-width: 800px;
          margin-top: 8px;
          border: 1px solid #eee;
          padding: 12px;
          height: 360px;
          overflow: auto;
          background: #fff;
          border-radius: 8px;
        }
        .chat-message { margin: 6px 0; padding: 8px; border-radius: 6px; }
        .ai { background: #f0f0f0; text-align: left; white-space: pre-wrap; }
        
        /* イベントカウンターパネル */
        #eventPanel {
          position: fixed;
          right: 12px;
          top: 12px;
          width: 260px;
          max-height: 70vh;
          overflow: auto;
          border-radius: 8px;
          background: #ffffffee;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          padding: 10px;
          font-size: 13px;
          z-index: 999;
          backdrop-filter: blur(4px); /* 背景のぼかしを追加 */
        }
        #eventPanel h3 { margin: 0 0 8px 0; font-size: 14px; }
        #eventTable { width: 100%; border-collapse: collapse; }
        #eventTable td { padding: 4px 6px; vertical-align: middle; }
        .name { max-width: 160px; word-break: break-all; color: #222; }
        .count { width: 48px; text-align: right; font-weight: 600; color: #111; }

        .log-container {
            margin-top: 10px;
            color: #444;
            font-size: 13px;
            max-width: 800px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
      `}</style>

      <ControlPanel
        status={state.status}
        onStart={startSession}
        onStop={stopSession}
        onClearEvents={handleClearEvents}
      />

      <LogContainer log={state.log} status={state.status} />

      <h2>会話</h2>
      <ChatContainer chatHistory={state.chatHistory} chatContainerRef={chatContainerRef} />

      <EventCounterPanel eventCounts={state.eventCounts} />
    </div>
  );
};

export default App;
