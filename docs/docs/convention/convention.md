# 개발 컨벤션

## 커밋 메시지, PR 제목

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 규칙을 따릅니다. 머리말은 `feat`(기능 추가), `fix`(버그 수정), `refactor`(리팩터링) 등이 있습니다.

### 예시

```
feat: `auth/` 경로에 로그인 기능 추가
test: 리뷰 삭제 서비스
fix: 도서 상세정보 검색시 특수문자 포함
refactor: for of를 map으로 변경
```

```
ex)
fix: 모델 validation 오류 수정

- Book title 제목 default 값 추가
- User intra 최소 길이 0으로 변경

ex)
test: bookController 테스트 코드 추가 

- 책 제목에 대한 유효성 테스트 추가
```

## 코드 스타일

eslint를 사용중이나 여러 문제가 있어 추후 변경될 수도 있습니다. (WIP)
