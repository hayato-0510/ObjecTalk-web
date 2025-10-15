// Node.js Backend Server (server.js)
// 役割:
// 1. フロントエンドにサービスを提供する
// 2. クライアントからのSDP OfferをOpenAI APIに転送し、Answerを安全に返す (APIキー保護のため)

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // .envファイルから環境変数を読み込む

const app = express();
const PORT = 3001; // バックエンドポート
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBRTC_URL = "https://api.openai.com/v1/realtime?model=gpt-realtime";

// CORS設定: Vite開発サーバー (デフォルト: http://localhost:5174) からのリクエストを許可
app.use(cors({ origin: 'http://localhost:5174' }));
app.use(express.text({ type: 'application/sdp' })); // SDPデータを受け取るための設定

// APIキーの確認
if (!OPENAI_API_KEY) {
    console.error("FATAL: OPENAI_API_KEYが.envファイルに設定されていません。");
    process.exit(1);
}

// ----------------------------------------------------
// WebRTC SDPリクエストをOpenAIにプロキシするエンドポイント
// ----------------------------------------------------
app.post('/api/sdp', async (req, res) => {
    const sdpOffer = req.body;
    console.log("-> SDP Offer from client received. Proxying to OpenAI...");

    try {
        // OpenAI APIへのリクエスト
        const response = await axios.post(WEBRTC_URL, sdpOffer, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/sdp",
                "instruction": "あなたはAIで語尾に「だひょん」をつけて話します", // "alloy"、"gemini-pro"、"gemini-1.5" など、利用可能なモデルを指定
            },
            // OpenAIからSDPがテキストで返ってくることを保証
            responseType: 'text'
        });

        // OpenAIから受け取ったSDP Answerをそのままクライアントに返送
        console.log("<- SDP Answer from OpenAI received. Sending back to client.");
        res.setHeader('Content-Type', 'application/sdp');
        res.send(response.data);

    } catch (error) {
        console.error("❌ OpenAI API Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send("Error fetching SDP from OpenAI.");
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log("⚠️ 開発を開始する前に、Viteサーバーも起動してください (npm run dev:client)。");
});
