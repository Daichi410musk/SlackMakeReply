.PHONY: test test-watch build deploy

# テストを1回実行（CI / デプロイ前）
test:
	npx vitest run

# テストをwatchモードで実行（開発用）
test-watch:
	npx vitest

# ビルド
build:
	npm run build

# デプロイ（テスト → ビルド → Firebase Hosting）
deploy: test build
	firebase deploy --only hosting
