# Node.js 22 を使用
FROM node:22.12

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# Viteの開発サーバーポートを公開
EXPOSE 5173

# バックエンドサーバーのポートを公開
EXPOSE 3001

# デフォルトコマンド
CMD ["npm", "run", "dev"]