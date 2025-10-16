# ⚙️ AI設定ガイド

このプロジェクトでは、セキュリティのために設定を2つのファイルに分けています。

## 📁 設定ファイルの役割

### 1. `.env` - API Keyの管理（Git管理外）
- **用途**: OpenAI API Keyなどの秘密情報
- **特徴**: Gitにコミットされない（`.gitignore`で除外）
- **共有**: チームメンバーと共有しない

### 2. `src/backend/ai.config.js` - AI設定の管理（Git管理下）
- **用途**: モデル、音声、プロンプトなどの設定
- **特徴**: Gitにコミットされる
- **共有**: チームメンバーと共有される

## 🚀 セットアップ手順

### ステップ1: API Keyを設定

```bash
# .env.exampleをコピー
copy .env.example .env

# .envファイルを編集
notepad .env
```

`.env`ファイル:
```env
OPENAI_API_KEY=your_actual_api_key_here
```

### ステップ2: AI設定をカスタマイズ

```bash
# ai.config.jsを編集
notepad src\backend\ai.config.js
```

`src/backend/ai.config.js`ファイル:
```javascript
export const AI_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'fable',
  systemPrompt: `あなたは親切なAIアシスタントです。`
};
```

### ステップ3: サーバーを起動

```bash
npm start
```

## 🎙️ 音声の種類

`ai.config.js`の`voice`を変更してください：

```javascript
export const AI_CONFIG = {
  voice: 'nova', // ← ここを変更
  // ...
};
```

| 声 | 特徴 |
|---|------|
| `alloy` | 中性的でバランスの取れた声 |
| `echo` | 男性的で落ち着いた声 |
| `fable` | 女性的で温かみのある声 |
| `onyx` | 深みのある男性的な声 |
| `nova` | 明るく活発な女性的な声 |
| `shimmer` | やさしく柔らかい女性的な声 |

## 🤖 モデルの変更

```javascript
export const AI_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17', // ← ここを変更
  // ...
};
```

利用可能なモデル:
- `gpt-4o-realtime-preview-2024-12-17` （推奨）
- その他のRealtime対応モデル

## 💬 システムプロンプトの設定

### シンプルな例

```javascript
export const AI_CONFIG = {
  systemPrompt: 'あなたは親切なAIアシスタントです。',
  // ...
};
```

### 複数行のプロンプト

バッククォート（\`）を使用すると複数行で書けます：

```javascript
export const AI_CONFIG = {
  systemPrompt: `# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
- The conversation will be only in English.`,
  // ...
};
```

### プロンプト例

#### 1. プログラミング講師
```javascript
systemPrompt: 'あなたは経験豊富なプログラミング講師です。初心者にもわかりやすく、丁寧に説明してください。'
```

#### 2. フレンドリーな友達
```javascript
systemPrompt: 'あなたは明るく元気な友達です。タメ口で親しみやすく会話してください。絵文字も使ってOKです😊'
```

#### 3. ビジネスアシスタント
```javascript
systemPrompt: 'あなたはプロフェッショナルなビジネスアシスタントです。簡潔で正確な情報を提供し、敬語を使用してください。'
```

#### 4. 子供向け先生
```javascript
systemPrompt: 'あなたは優しい先生です。小学生にもわかるように、簡単な言葉で説明してください。難しい言葉は使わないでね。'
```

## 📝 設定の反映

1. `ai.config.js`を編集
2. サーバーを再起動（`Ctrl+C` → `npm start`）
3. 起動ログで設定を確認

```
✅ Backend server running on http://localhost:3001
🎙️  Voice: fable
🤖 Model: gpt-4o-realtime-preview-2024-12-17
💬 System Prompt: # Personality & Tone...
```

## 🔒 セキュリティのベストプラクティス

### ✅ DO
- `.env`ファイルはGitにコミットしない
- API Keyは`.env`で管理
- AI設定（model, voice, prompt）は`ai.config.js`で管理
- `.env.example`はサンプルとして共有OK

### ❌ DON'T
- API Keyをコード内にハードコードしない
- `.env`ファイルをGitHubなどに公開しない
- API Keyをチャットやメールで共有しない

## 🐳 Docker環境での設定

Dockerを使用している場合も同じ手順です：

```bash
# 設定を変更
notepad src\backend\ai.config.js

# コンテナを再起動
docker-compose restart backend
```

## トラブルシューティング

### 設定が反映されない
- サーバーを完全に再起動
- `ai.config.js`の保存を確認
- シンタックスエラーがないか確認

### エラー: Cannot find module './ai.config.js'
- ファイルパスが正しいか確認
- `src/backend/`ディレクトリに`ai.config.js`があるか確認

### API Key エラー
- `.env`ファイルが存在するか確認
- API Keyが正しいか確認
- OpenAIアカウントに十分なクレジットがあるか確認

## チーム開発での運用

### 開発者A
1. `ai.config.js`を編集（プロンプト改善）
2. Gitにコミット＆プッシュ
3. チームに共有

### 開発者B
1. Gitからプル
2. 自分の`.env`にAPI Keyを設定（各自で用意）
3. サーバー起動

→ プロンプトは共有、API Keyは各自管理！
