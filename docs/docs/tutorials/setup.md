# 개발 가이드

## 실행하기

1. 백엔드 모노레포를 사용하기 위해 `pnpm`을 설치해주세요.

```sh
corepack prepare pnpm@latest --activate
```

2. 패키지들을 설치해주세요.

```sh
pnpm install
```

3. `backend/`가 `contracts/` 패키지에 의존하므로, 터미널 창을 2개 준비해주세요.

```sh
# 터미널 #1
cd contracts
pnpm dev

# 터미널 #2
cd backend
pnpm dev
```

4. 올바르게 실행된다면 `https://localhost:3000/swagger-v2` 경로에 접속해 API 문서를 확인하실 수 있습니다.

![swagger-v2](https://github.com/jiphyeonjeon-42/backend/assets/54838975/21c160f9-150b-4321-a9fa-0c61842477b0)
