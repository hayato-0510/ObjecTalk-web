// Node.js Backend Server (server.js)
// 役割:
// 1. フロントエンドにサービスを提供する
// 2. クライアントからのSDP OfferをOpenAI APIに転送し、Answerを安全に返す (APIキー保護のため)

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { AI_CONFIG } from './ai.config.js';

dotenv.config(); // .envファイルから環境変数を読み込む

const app = express();
const PORT = 3001; // バックエンドポート
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VOICE = AI_CONFIG.voice;
const MODEL = AI_CONFIG.model;
let SYSTEM_PROMPT = AI_CONFIG.systemPrompt;
const WEBRTC_URL = `https://api.openai.com/v1/realtime?model=${MODEL}&voice=${VOICE}`;

// CORS設定: Vite開発サーバー (デフォルト: http://localhost:5174) からのリクエストを許可
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.text({ type: 'application/sdp' })); // SDPデータを受け取るための設定
app.use(express.json()); // JSONデータを受け取るための設定

// APIキーの確認
if (!OPENAI_API_KEY) {
    console.error("FATAL: OPENAI_API_KEYが.envファイルに設定されていません。");
    process.exit(1);
}

// ----------------------------------------------------
// ロールプロンプトを生成する関数
// ----------------------------------------------------
async function generateRolePrompt(roleKeyword) {
    try {
        console.log(`🤖 ロールキーワード「${roleKeyword}」からプロンプトを生成中...`);
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'あなたはAIキャラクター設定の専門家です。与えられたキーワードから、そのキャラクターになりきるための詳細なロール設定を生成してください。'
                },
                {
                    role: 'user',
                    content: `以下のキーワードをベースに、音声対話AIのロール設定を生成してください：

キーワード: 「${roleKeyword}」

以下の形式で出力してください：
# Role
[このキャラクターの詳細な説明。性格、話し方、特徴など]

# Speaking Style
[話し方の特徴、語尾、言葉遣いなど]

# Approach
[ユーザーとの対話でどのように振る舞うか]

注意：
- 創造的で魅力的なキャラクター設定を考えてください
- 音声対話に適した自然な話し方を設定してください
- 日本語で対話するキャラクターとして設定してください`
                }
            ],
            temperature: 0.8,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const generatedRole = response.data.choices[0].message.content;
        console.log('✅ ロールプロンプトを生成しました\n');
        console.log('--- Generated Role ---');
        console.log(generatedRole);
        console.log('--- End of Role ---\n');
        
        return generatedRole + '\n\n' + AI_CONFIG.baseSystemPrompt;
        
    } catch (error) {
        console.error('❌ ロールプロンプト生成エラー:', error.message);
        console.log('⚠️ デフォルトプロンプトを使用します');
        return AI_CONFIG.baseSystemPrompt;
    }
}

// ----------------------------------------------------
// 起動時の初期化処理
// ----------------------------------------------------
async function initialize() {
    if (AI_CONFIG.roleKeyword) {
        SYSTEM_PROMPT = await generateRolePrompt(AI_CONFIG.roleKeyword);
    } else {
        SYSTEM_PROMPT = AI_CONFIG.baseSystemPrompt;
    }
}

// ----------------------------------------------------
// システムプロンプトを取得するエンドポイント
// ----------------------------------------------------
app.get('/api/config', (req, res) => {
    res.json({
        systemPrompt: SYSTEM_PROMPT,
        voice: VOICE,
        model: MODEL
    });
});

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
                "Content-Type": "application/sdp"
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

// ----------------------------------------------------
// サーバー起動
// ----------------------------------------------------
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Backend server running on http://localhost:${PORT}`);
        console.log(`🎙️  Voice: ${VOICE}`);
        console.log(`🤖 Model: ${MODEL}`);
        if (AI_CONFIG.roleKeyword) {
            console.log(`🎭 Role Keyword: ${AI_CONFIG.roleKeyword}`);
        }
        console.log(`💬 System Prompt: ${SYSTEM_PROMPT.substring(0, 100)}...`);
        console.log("⚠️ 開発を開始する前に、Viteサーバーも起動してください (npm run dev:client)。");
    });
});
