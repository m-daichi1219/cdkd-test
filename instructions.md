このプロジェクトではAWS CDKを高速でデプロイできるcdkdを試してみることを目的としています。
依頼範囲は、cdkでデプロイ可能な状態のベースとなるところまでの実装です。
cdkdの導入とcdkdの実行は手で実施するため、その直前までプロジェクトを完成させます。

## 技術前提

- コードはすべてTypeScript。ライブラリ管理はnpm（ルートの npm workspaces）
- AWSリージョンは `ap-northeast-1`
- CDK v2（`aws-cdk-lib`）。`cdk.json` はリポジトリルート
- cdkd の依存追加・bootstrap・deploy は対象外（標準 CDK アプリとして完成させる）

## フォルダ構成

- `infra` … CDK の Stack などを実装するフォルダ
- `backend` … Lambda の実装を記載するフォルダ
- `front` … 静的コンテンツ（Webページ）のコードを実装するフォルダ

## CDK Stack

### BackendStack

- API Gateway REST API、Lambda、VPC
- Lambda は意図して VPC 内に配置する。呼び出しは API Gateway 経由のみ
- API Gateway に API Key / Token は不要。WAF もなし。認可は NONE
- VPC: プライベート隔離サブネット × 2AZ。NAT Gateway / VPC Endpoint なし（コスト抑制）
- Lambda ランタイムは Node.js 24（`nodejs24.x`）
- Lambda は三つ。GET で決められた JSON を返すだけ（引数検査なし）
  - `GET /hello` → `{ "message": "Say Hello" }`
  - `GET /goodnight` → `{ "message": "Say GoodNight" }`
  - `GET /goodbye` → `{ "message": "Say Goodbye" }`
- 各 Lambda は `backend/src` 配下の handler を参照する
- CORS はテスト用に全オリジン許可（フロントが CloudFront から直接 REST API を叩くため）

### FrontStack

- CloudFront と S3 で静的コンテンツを配信する最小構成
- カスタムドメイン / WAF は不要（CloudFront デフォルトドメイン）
- S3 は非公開、Origin Access Control (OAC) で CloudFront からのみ配信
- 配信物は `front` の Vite ビルド成果物（`front/dist`）
- API URL は CDK から注入しない。フロントはビルド時の `VITE_API_URL` を使う

## backend

- `src` 配下に 3 ファイル（`hello.ts` / `goodnight.ts` / `goodbye.ts`）
- それぞれ Lambda handler を実装。決められた Response を返すだけ

## front

- Vue 3 + Vite で静的コンテンツを実装
- ボタンが 3 つあり、押すと各 Lambda に対応する REST API の GET をリクエストする
- レスポンスを画面に描画する
- API のベース URL は `VITE_API_URL` を手で入れて `npm run build` する

## デプロイ順序（CDK / cdkd は利用者が実行）

1. BackendStack をデプロイし、出力の API URL を取得する
2. `VITE_API_URL` をセットして `front` をビルドする
3. FrontStack をデプロイする
