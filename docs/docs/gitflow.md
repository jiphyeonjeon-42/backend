# Git Flow Strategy

## `main` 브랜치
- 완성된 기능들이 들어있는 가장 최신의 브랜치입니다. develop 브랜치에서만 푸시를 받습니다.

## `develop` 브랜치
- 개발중인 기능들이 이슈 단위로 완료되어 들어오는 브랜치입니다. issue 브랜치에서 푸시를 받습니다.

## issue 브랜치 (eg. `42-issue-추가`)
- 개별 이슈에 대한 개발이 진행되는 브랜치입니다.
- 이슈에서 create_branch 기능을 이용하여 자동으로 생성합시다.
- 여러 이슈로 이루어진 이슈는 여러 이슈를 가진 이슈로 묶어 Umbrella issue 로 관리합니다. [이슈 전략 페이지로 링크]
- 이슈를 해결한 후 pull request 를 생성합니다.
- 리뷰를 받은 후 **_squash merge_** 로 develop 브랜치에 merge 합니다.


## 개인 브랜치
둘 이상의 인원이 하나의 issue 브랜치에서 작업할 경우에 `issue/23_jolim`같은 방식으로 이름지어서 푸시합니다.