## 1. commit의 기준

- commit은 아래 커밋 타입에 맞게 commit들을 분리한다.

## 2. commit의 타입

- FEAT: 기능을 추가 또는 수정
- ENV: 개발 환경을 추가 또는 수정 (eslint 변경, dockerfile 변경 등)
- FIX: 버그를 해결
- DOCS: 문서를 수정 ([README.md](http://readme.md/) 변경, swagger)
- STYLE: 코드 스타일 변경 (prettier, npm run lint 등)
- REFACT: 코드를 리팩토링, 기능은 같고 코드가 변경
- TEST: 테스트 코드를 추가 또는 수정
- MERGE: 풀 리퀘스트 머지할 경우
- CHORE: 단순오타
- WIP: working in process 아직 작업중인 내용

## 3. commit 예시

```
ex)
FIX: 모델 validation 오류 수정
- Book title 제목 default 값 추가
- User intra 최소 길이 0으로 변경

ex)
FEAT: 로그인 기능 추가
- auth/ api 추가

ex)
TEST: bookController 테스트 코드 추가 
- 책 제목에 대한 유효성 테스트 추가
```

## 4. 네이밍
변수명, 함수명, 칼럼명, 파일명은 camelCase를 사용한다.  
클래스명, 타입명은 PascalCase를 사용한다.  
테이블명은 snake_case를 사용한다.  

## 5. ts파일의 import
(*).service.ts 파일을 import할 때는 카멜케이스로 (*)Service라고 import한다.  
e.g.) users.service.ts를 import할 경우 `import * as usersService from ../users/users.service.ts`같이 적는다.
