# ⚡ AI設定 - クイックリファレンス

## 📋 2つの設定ファイル

| ファイル | 用途 | Git管理 | 共有 |
|---------|------|---------|------|
| `.env` | **API Key** | ❌ 管理外 | ❌ 共有しない |
| `src/backend/ai.config.js` | **AI設定** | ✅ 管理下 | ✅ 共有OK |

## 🚀 初期セットアップ

```bash
# 1. API Keyを設定
copy .env.example .env
notepad .env
# → OPENAI_API_KEY=your_api_key_here

# 2. AI設定をカスタマイズ（オプション）
notepad src\backend\ai.config.js

# 3. 起動
npm start
```

## ⚙️ AI設定の変更

`src/backend/ai.config.js`を編集：

```javascript
export const AI_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'fable',  // ← 声を変更
  systemPrompt: `あなたは親切なAIアシスタントです。`  // ← プロンプトを変更
};
```

### 音声の種類

| 声 | 特徴 |
|---|------|
| `alloy` | 中性的 |
| `echo` | 男性的で落ち着いた |
| `fable` | 女性的で温かみ |
| `onyx` | 深みのある男性的 |
| `nova` | 明るく活発 |
| `shimmer` | やさしく柔らかい |

## 📝 プロンプト例

### シンプル
```javascript
systemPrompt: 'あなたは親切なAIアシスタントです。'
```

### 複数行
```javascript
systemPrompt: `# 役割
あなたは経験豊富なプログラミング講師です。

# ルール
1. 初心者にもわかりやすく説明
2. 具体例を示す
3. 丁寧な言葉遣い`
```

## 🔄 変更の反映

```bash
# サーバーを再起動
Ctrl+C  # 停止
npm start  # 起動
```

## ✅ 確認

起動ログで設定を確認：
```
🎙️  Voice: fable
🤖 Model: gpt-4o-realtime-preview-2024-12-17
💬 System Prompt: あなたは親切なAIアシスタントです。
```

詳細は `AI-CONFIG-GUIDE.md` を参照。
