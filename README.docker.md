# Docker環境でのセットアップ

このプロジェクトはDockerを使用して簡単に開発環境を構築できます。

## 前提条件

- Docker Desktop がインストールされていること
- Git がインストールされていること（リポジトリのクローン用）

## セットアップ手順

### 1. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、必要な環境変数を設定します。

```bash
# Windowsの場合
copy .env.example .env

# Mac/Linuxの場合
cp .env.example .env
```

`.env` ファイルを編集して、OpenAI API キーを設定してください：

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
```

AI設定（モデル、音声、プロンプト）は `src/backend/ai.config.js` で管理します。
詳細は `AI-CONFIG-GUIDE.md` を参照してください。

### 2. Dockerコンテナの起動

```bash
docker-compose up --build
```

初回起動時は、Dockerイメージのビルドと依存関係のインストールに時間がかかります。

### 3. アプリケーションへのアクセス

起動が完了したら、以下のURLでアクセスできます：

- **フロントエンド (Vite)**: http://localhost:5173
- **バックエンド (Express)**: http://localhost:3001

## 利用可能なコマンド

### コンテナをバックグラウンドで起動

```bash
docker-compose up -d
```

### コンテナの停止

```bash
docker-compose down
```

### コンテナのログを確認

```bash
# 全てのコンテナのログ
docker-compose logs -f

# フロントエンドのみ
docker-compose logs -f frontend

# バックエンドのみ
docker-compose logs -f backend
```

### コンテナ内でコマンドを実行

```bash
# フロントエンドコンテナでnpmコマンドを実行
docker-compose exec frontend npm install <package-name>

# バックエンドコンテナでコマンドを実行
docker-compose exec backend npm run <script-name>
```

### コンテナとボリュームを完全に削除

```bash
docker-compose down -v
```

### イメージを再ビルド

```bash
docker-compose up --build
```

## トラブルシューティング

### ポートが既に使用されている

エラー: `Bind for 0.0.0.0:5173 failed: port is already allocated`

**解決方法**: 
- 既存のプロセスを停止する
- または `docker-compose.yml` のポート番号を変更する

```yaml
ports:
  - "5174:5173"  # 別のポートにマッピング
```

### node_modules の問題

依存関係のインストールで問題が発生した場合：

```bash
# コンテナとボリュームを削除して再起動
docker-compose down -v
docker-compose up --build
```

### ホットリロードが動作しない

Windowsの場合、ファイル監視の設定が必要な場合があります。
`vite.config.ts` に以下を追加：

```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
  },
})
```

## 開発のヒント

- **コードの変更**: ローカルのファイルを編集すると、Dockerコンテナ内に自動的に反映されます（ボリュームマウント）
- **パッケージの追加**: コンテナ内でnpmコマンドを実行するか、ローカルで実行後にコンテナを再起動してください
- **デバッグ**: `docker-compose logs -f` でリアルタイムログを確認できます

## 本番環境向けビルド

```bash
# ビルドのみ実行
docker-compose exec frontend npm run build

# ビルド結果のプレビュー
docker-compose exec frontend npm run preview
```

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
- [Vite公式ドキュメント](https://vitejs.dev/)
