# cdkd-test

AWS CDK で API Gateway + VPC Lambda + CloudFront/S3 をデプロイできる最小構成です。  
[cdkd](https://github.com/go-to-k/cdkd/) の導入・実行はこのリポジトリでは行いません。標準の CDK アプリとして `cdk synth` できるところまでが完成形です。

## 構成

| ディレクトリ | 役割 |
| --- | --- |
| `infra` | CDK アプリ（`BackendStack` / `FrontStack`） |
| `backend` | Lambda handler（Node.js 24） |
| `front` | Vue 3 + Vite の静的サイト |

リージョンは `ap-northeast-1` 固定です。

### BackendStack

- 新規 VPC（隔離サブネット × 2AZ）。NAT Gateway / VPC Endpoint なし
- REST API（認可なし、API Key なし、WAF なし）
  - `GET /hello`
  - `GET /goodnight`
  - `GET /goodbye`
- 各 Lambda は VPC 内。呼び出しは API Gateway のみ

隔離サブネットかつ VPC Endpoint なしのため、**Lambda の CloudWatch Logs は出ません**（関数自体の実行と API 応答は問題ありません）。ログが必要になったら Logs 用 VPC Endpoint を足してください。NAT はコストがかかるのでこのプロジェクトでは使いません。

### FrontStack

- 非公開 S3 + CloudFront（OAC、デフォルト証明書）
- 配信物は `front/dist`（Vite のビルド成果物）
- API URL は CDK から注入しません。`VITE_API_URL` を手で入れて `front` をビルドします

## 必要環境

- Node.js 20 以上（Lambda 実行環境は 24）
- npm
- AWS CLI で使える認証情報（デプロイ時）
- 対象アカウントで CDK bootstrap 済みであること

```bash
# 未実施なら（利用者側）
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1
```

## セットアップ

```bash
npm install
```

フロントの初回ビルド（placeholder URL で可。`cdk synth` が `front/dist` を参照するため）:

```bash
cp front/.env.example front/.env
npm run build:front
```

テンプレートの合成:

```bash
npx cdk synth
# または
npm run synth
```

## デプロイ手順（CDK または cdkd）

API URL はフロントのビルド時に埋め込まれるため、**Backend → front ビルド → Front** の順にしてください。  
`cdk deploy --all` を初回から一発で回すと、フロントが placeholder URL のまま配信されます。

### 1. BackendStack

```bash
npx cdk deploy BackendStack
# cdkd を入れる場合の例:
# cdkd deploy BackendStack
```

出力 `BackendStack.ApiUrl` を控えます。末尾の `/` の有無はフロント側で吸収します。例:

```
https://abc123.execute-api.ap-northeast-1.amazonaws.com/prod/
```

### 2. フロントを本番 URL でビルド

`front/.env` を作成（または上書き）:

```bash
VITE_API_URL=https://abc123.execute-api.ap-northeast-1.amazonaws.com/prod
```

```bash
npm run build:front
```

ローカル確認:

```bash
# 開発サーバ（front/.env の VITE_API_URL を読む）
npm run dev:front

# ビルド成果物のプレビュー
npm run preview:front
```

### 3. FrontStack

```bash
npx cdk deploy FrontStack
# cdkd deploy FrontStack
```

出力 `FrontStack.DistributionDomainName` をブラウザで開きます。

```
https://<DistributionDomainName>/
```

CloudFront の初回作成は数分かかります。cdkd では `--no-wait` で安定化待ちを飛ばせます（配信可能になるタイミングは AWS 側の伝播待ち）。

### まとめてデプロイする場合

front を正しい `VITE_API_URL` でビルド済みなら:

```bash
npx cdk deploy --all
```

## 画面の動作

3 つのボタンがそれぞれ `GET {VITE_API_URL}/hello` などを呼び、JSON の `message` を表示します。

## 削除

```bash
npx cdk destroy --all
```

S3 は `autoDeleteObjects` 付きです。CloudFront の削除は時間がかかることがあります。

## cdkd を試すとき

このアプリは通常の CDK アプリなので、リポジトリルートで cdkd を入れればそのまま使えます。詳細は [go-to-k/cdkd](https://github.com/go-to-k/cdkd/) を参照してください。

```bash
npm i -g @go-to-k/cdkd
cdkd bootstrap   # 初回のみ
cdkd deploy BackendStack
# front をビルドしてから
cdkd deploy FrontStack
```
