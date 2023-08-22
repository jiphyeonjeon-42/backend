# Git Flow Strategy

집현전 백엔드는 배포용 브랜치인 `main`과 개발용 브랜치인 `develop` 둘로 나뉜
[git-flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) 전략을
사용하고 있습니다.

## `main` 브랜치

- <server.42library.kr>에 배포중인 서버의 소스코드가 들어있는 브랜치입니다.
- `develop` 브랜치에서 머지하면 AWS에 자동으로 배포됩니다.

## `develop` 브랜치

- 개발중인 기능들이 이슈 단위로 완료되어 들어오는 브랜치입니다.
- issue 브랜치에서 푸시를 받습니다.

## issue 브랜치 (eg. `42-issue-추가`)

![](https://github.com/jiphyeonjeon-42/backend/assets/54838975/cf844b41-1690-44b2-9bf5-7ad69dbc401a)

연관 문서: [이슈 전략](./issue_strategy.md)

- 개별 이슈에 대한 개발이 진행되는 브랜치입니다.
- 이슈 탭에서 `Create a Branch` 버튼을 눌러 쉽게 생성 가능합니다.
- 진행 기간이 긴 (~1주일) 이슈는 [우산 이슈](./issue_strategy.md)를 사용해 관리합니다.
- 이슈를 해결한 후 pull request 를 생성합니다.
- 리뷰를 받은 후 **_squash merge_** 로 develop 브랜치에 merge 합니다.

## 개인 브랜치

둘 이상의 인원이 하나의 issue 브랜치에서 작업할 경우에 `issue/23_jolim`같은 방식으로 이름지어서
푸시합니다.
