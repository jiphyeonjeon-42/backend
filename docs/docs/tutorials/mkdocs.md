# Mkdocs로 개발 문서 작성하기
### 로컬에서 정적 페이지 빌드
1. working directory의 루트 디렉토리에 docs/ 생성
2. mkdocs 설치 (mkdocs 공식문서 참조)
3. 프로젝트 생성 `mkdocs new [프로젝트 이름]`
4. 빌드 `mkdocs build`
	- site 디렉토리에 정적 페이지 생성
5. 실행 `mkdocs run`

### github 에 정적 페이지 배포법
... 로컬에서 정적 페이지 빌드하는 것까지는 똑같은데
1. `mkdocs gh-pages` 명령을 내리면 소속된 레포지토리의 gh-pages 디렉토리에 정적 사이트를 배포해버림
2. github -> setting -> github pages 에 branch 를 gh-pages 

### github  에 정적 페이지 자동 배포
앞에서 알아본 배포법은 직접 빌드하고 배포까지 해야 한다. 매우 귀찮음.
github action 을 통해 특정 트리거가 발생하면 자동으로 빌드 - 배포를 하도록 만들 수 있음.
이를 위해서는 .github/workflows/ 디렉토리에 .yml 파일 작성 ( github action 을 작동시킬 파일 ) 해야한다.
yml 의 예시는.. 디렉토리 참조.
