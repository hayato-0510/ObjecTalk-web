# 🎯 設定管理の変更まとめ

## 📋 変更内容

API KeyとAI設定を分離し、セキュリティとチーム開発の利便性を向上させました。

## 新しい構成

### Before（変更前）
すべて`.env`で管理：
```env
OPENAI_API_KEY=xxx
MODEL=gpt-4o-realtime-preview-2024-12-17
VOICE=fable
SYSTEM_PROMPT=...
```

**問題点:**
- API Keyと設定が混在
- Gitで管理できない（`.env`は`.gitignore`対象）
- チームで設定を共有しにくい

### After（変更後）

#### 1. `.env` - API Keyのみ
```env
OPENAI_API_KEY=xxx
```

#### 2. `src/backend/ai.config.js` - AI設定
```javascript
export const AI_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'fable',
  systemPrompt: `...`
};
```

**メリット:**
- ✅ API KeyとAI設定が分離
- ✅ AI設定はGitで管理・共有可能
- ✅ API Keyは各開発者が個別管理
- ✅ チーム全体で同じAI設定を使用可能

## 📁 ファイル構成

```
ObjecTalk-web/
├── .env                          # API Key（Git管理外）
├── .env.example                  # API Key設定のテンプレート
├── src/
│   └── backend/
│       ├── server.js             # ai.config.jsから設定を読み込み
│       └── ai.config.js          # AI設定（Git管理下）★ NEW
└── docs/
    ├── AI-CONFIG-GUIDE.md        # 詳細ガイド ★ NEW
    └── AI-CONFIG-QUICK-REF.md    # クイックリファレンス ★ NEW
```

## 🚀 使い方

### 初期セットアップ

```bash
# 1. API Keyを設定（初回のみ）
copy .env.example .env
notepad .env
# → OPENAI_API_KEY を設定

# 2. サーバー起動
npm start
```

### AI設定の変更

```bash
# ai.config.jsを編集
notepad src\backend\ai.config.js

# サーバーを再起動
Ctrl+C
npm start
```

## ⚙️ 設定例

### 音声を変更

`src/backend/ai.config.js`:
```javascript
export const AI_CONFIG = {
  voice: 'nova', // fable → nova に変更
  // ...
};
```

### プロンプトを変更

```javascript
export const AI_CONFIG = {
  systemPrompt: `あなたは親切なプログラミング講師です。
初心者にもわかりやすく説明してください。`,
  // ...
};
```

## 🔒 セキュリティ

| ファイル | 内容 | Git管理 | 共有 | 理由 |
|---------|------|---------|------|------|
| `.env` | API Key | ❌ | ❌ | 秘密情報 |
| `ai.config.js` | AI設定 | ✅ | ✅ | 公開OK |

### `.gitignore`での保護

`.env`ファイルは`.gitignore`に含まれており、Gitにコミットされません：

```gitignore
.env
```

## 👥 チーム開発のワークフロー

### 開発者A: プロンプトを改善
```bash
# 1. ai.config.jsを編集
notepad src\backend\ai.config.js

# 2. テスト
npm start

# 3. Gitにコミット
git add src/backend/ai.config.js
git commit -m "Improve system prompt"
git push
```

### 開発者B: 変更を取得
```bash
# 1. プル
git pull

# 2. 自分のAPI Keyを設定（初回のみ）
notepad .env

# 3. 起動（新しいプロンプトが反映される）
npm start
```

## 📊 比較表

| 項目 | Before | After |
|------|--------|-------|
| API Key管理 | `.env` | `.env` |
| AI設定管理 | `.env` | `ai.config.js` |
| Git管理 | ❌ すべて管理外 | ✅ AI設定のみ管理 |
| チーム共有 | ❌ 困難 | ✅ 容易 |
| セキュリティ | ⚠️ 混在 | ✅ 分離 |

## 📝 マイグレーション手順

既存の`.env`ファイルから移行する場合：

```bash
# 1. 現在の設定を確認
notepad .env

# 2. MODEL, VOICE, SYSTEM_PROMPTをコピー
# 3. ai.config.jsに貼り付け
notepad src\backend\ai.config.js

# 4. .envからMODEL, VOICE, SYSTEM_PROMPTを削除
# 5. OPENAI_API_KEYのみ残す
```

## 🔄 自動移行（オプション）

PowerShellで自動移行：

```powershell
# .envファイルをバックアップ
Copy-Item .env .env.backup

# API Keyのみの新しい.envを作成
"OPENAI_API_KEY=$((Get-Content .env | Select-String 'OPENAI_API_KEY').Line)" | Set-Content .env
```

## ✅ 確認

サーバー起動時のログで確認：

```
✅ Backend server running on http://localhost:3001
🎙️  Voice: fable
🤖 Model: gpt-4o-realtime-preview-2024-12-17
💬 System Prompt: # Personality & Tone...
```

## 📚 参考ドキュメント

- `AI-CONFIG-GUIDE.md` - 詳細な設定ガイド
- `AI-CONFIG-QUICK-REF.md` - クイックリファレンス
- `.env.example` - 環境変数テンプレート
- `src/backend/ai.config.js` - AI設定ファイル

これで、セキュアかつチーム開発しやすい設定管理ができます！
