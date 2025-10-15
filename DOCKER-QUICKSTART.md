# Docker セットアップ - クイックスタート

## 🚀 最速で始める方法

### 1. 環境変数を設定

```powershell
# .envファイルを作成
Copy-Item .env.example .env

# エディタで .env を開いてAPIキーを設定
notepad .env
```

### 2. Dockerコンテナを起動

```powershell
docker-compose up --build
```

### 3. ブラウザでアクセス

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3001

## 📝 よく使うコマンド

```powershell
# 起動（バックグラウンド）
docker-compose up -d

# 停止
docker-compose down

# ログを見る
docker-compose logs -f

# 完全にクリーンアップ
docker-compose down -v

# パッケージを追加
docker-compose exec frontend npm install <package-name>
```

## ⚠️ トラブルシューティング

### ポートが使われている場合

既存のプロセスを停止するか、`docker-compose.yml`のポート番号を変更してください。

### node_modulesの問題

```powershell
docker-compose down -v
docker-compose up --build
```

詳細は `README.docker.md` を参照してください。
