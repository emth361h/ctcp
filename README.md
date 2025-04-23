# Docker VPS マネージャー ウェブコンソール

VPSサーバー上のDockerコンテナ、ネットワーク、イメージ、リソースを管理するためのウェブベースのコントロールパネルです。このアプリケーションは、包括的なDocker管理のためのユーザーインターフェースと管理者インターフェースの両方を提供します。

## 機能

### ユーザー機能
- コンテナ管理（作成、起動、停止、再起動、削除）
- ネットワーク管理（作成、接続、切断、削除）
- イメージ管理（取得、ビルド、削除）
- Docker Compose管理
- Dockerfile管理
- リソースモニタリング（CPU、メモリ、ストレージ）

### 管理者機能
- すべてのユーザー機能
- ユーザー管理（ユーザーの作成、編集、削除）
- ユーザーごとのリソース割り当て
- システム全体のモニタリング
- 詳細なリソース使用統計

## アーキテクチャ

このアプリケーションは、以下の技術を使用して構築されています：

- **バックエンド**: Node.js と Express
- **フロントエンド**: React と TypeScript と Material UI
- **データベース**: MongoDB
- **プロキシ**: Nginx
- **コンテナ化**: Docker と Docker Compose

## 前提条件

- Ubuntu 24.04（または互換性のあるLinuxディストリビューション）
- Docker と Docker Compose がインストールされていること
- Git（リポジトリのクローン用）

## インストール

1. リポジトリをクローンします：
   ```
   git clone <repository-url>
   cd docker-vps-manager
   ```

2. 前提条件を確認します：
   ```
   ./check-prerequisites.sh
   ```

3. セットアップスクリプトを実行します：
   ```
   ./setup.sh
   ```

4. アプリケーションを起動します：
   ```
   ./start.sh
   ```

5. アプリケーションにアクセスします：
   - ブラウザを開き、`http://localhost` にアクセスします
   - デフォルトの管理者認証情報: admin@example.com / adminpassword
```

## プロジェクト構造

```
.
├── backend/                 # バックエンドAPI
│   ├── src/                 # ソースコード
│   │   ├── controllers/     # リクエストハンドラ
│   │   ├── middleware/      # Expressミドルウェア
│   │   ├── models/          # Mongooseモデル
│   │   ├── routes/          # APIルート
│   │   ├── utils/           # ユーティリティ関数
│   │   └── index.js         # エントリーポイント
│   ├── data/                # データストレージ
│   │   ├── compose/         # Docker Composeファイル
│   │   └── dockerfiles/     # Dockerfileストレージ
│   └── Dockerfile           # バックエンドDockerイメージ
├── frontend/                # フロントエンドReactアプリ
│   ├── src/                 # ソースコード
│   │   ├── components/      # 再利用可能なコンポーネント
│   │   ├── context/         # Reactコンテキスト
│   │   ├── pages/           # ページコンポーネント
│   │   ├── utils/           # ユーティリティ関数
│   │   ├── App.tsx          # メインアプリコンポーネント
│   │   └── index.tsx        # エントリーポイント
│   └── Dockerfile           # フロントエンドDockerイメージ
├── nginx/                   # Nginx設定
│   ├── conf/                # 設定ファイル
│   └── Dockerfile           # NginxのDockerイメージ
├── data/                    # 永続データ
│   └── mongo/               # MongoDBデータ
└── docker-compose.yml       # Docker Compose設定
```

## 開発

### バックエンド開発

```
cd backend
npm install
npm run dev
```

### フロントエンド開発

```
cd frontend
npm install
npm start
```

## API ドキュメント

APIドキュメントは、アプリケーション実行時に `/api/docs` で利用できます。

## セキュリティに関する考慮事項

- アプリケーションは認証にJWTを使用しています
- すべてのAPIエンドポイントは認証ミドルウェアで保護されています
- 管理者専用ルートはロールベースの認可で保護されています
- コンテナリソース制限はユーザーごとに適用されます

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細はLICENSEファイルを参照してください。

## 貢献

貢献は歓迎します！プルリクエストを自由に提出してください。
