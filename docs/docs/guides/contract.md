# Contract 작성법

본 글은 [ts-rest 공식문서 가이드](https://ts-rest.com/docs/quickstart) 를 토대로 작성된 글입니다.

자세한 설명은 원본을 참고해주세요

## Contract 에 대한 사전 지식
### Contract 를 작성하는 이유
- 백엔드 서비스가 계약한 API 스펙대로 동작하는지 확인해야 한다. 
  - 서비스가 요청 및 응답 데이터를 올바르게 처리하는가: XML, JSON, Query params 등
  - 데이터 포맷이 완성되었는가: 최대길이, 데이터타입, 요구되는 필드 등
  - HTTP status 가 올바르게 사용되었는가
  - 백엔드가 리소스/메서드마다 요청에 대해 응답하는가
- 집현전 프로젝트는 Contract 를 작성하는 툴로 ts-rest 를 사용한다.

### ts-rest 특징
- ***ts-rest*** 는 ***API* 에 대한 계약을 정의하는 방법** 을 제공한다.
- 종단 간 **type-safe** 보장
- *RPC* 와 같은 **클라이언트 인터페이스** 제공
- [작은 번들 크기](https://bundlephobia.com/package/@ts-rest/core)(2.2kb!)
- **테스트**에 용이하다
- 추가적인 코드 생성 없음
    >많은 프레임워크나 라이브러리에서는 특정 기능이나 구조를 위해 자동으로 코드를 생성하기도 합니다.
  > 자동으로 생성된 코드는 때로는 예기치 않은 방식으로 동작할 수 있습니다.
  > 또한 기본 코드와 생성된 코드 사이에서 불일치가 발생할 수 있고 생성된 코드가 업데이트되거나 변경될 때 발생하는 부작용을 추적하기 어려울 수 있습니다. 

- 런타임 유형 검사를 위한 *Zod* 지원
- OpenAPI 통합 가능

### ts-rest 사용 전 준비
zod 를 설치해야 한다.
`tsconfig.json` 파일에 strict 를 허용해야한다. Zod 를 사용하기 위해서 필요

```json
    {
      "compilerOptions": {
        ...
        "strict": true
      }
    }
```

- zod 사용법도 익혀두어야 한다.

[//]: # (TODO Zod 사용법 링크 추가 필요)

## 집현전 프로젝트에서 contract 추가
- ~/backend/contract 디렉토리에서 작업이 이루어진다
- 전체적인 작업 프로세스는 [프로젝트 개요](https://jiphyeonjeon-42.github.io/backend/explanation/) 참조
- ~/backend/contract/src 내부에 router 마다 디렉토리를 생성해서 작성하면 된다.
- reviews contract 를 예시로 들어 설명하겠다.

### reviews contract 설명
```typescript title="reviews/index.ts"
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { bookInfoIdSchema, bookInfoNotFoundSchema } from '../shared';
import {
    contentSchema,
    mutationDescription,
    reviewIdPathSchema,
    reviewNotFoundSchema,
} from './schema';

export * from './schema';

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
const c = initContract();

export const reviewsContract = c.router(
    {
        post: {
            method: 'POST',
            path: '/',
            //  z.object 는 zod 라이브러리의 문법이다. zod 사용법 참고
            query: z.object({ bookInfoId: bookInfoIdSchema.openapi({ description: '도서 ID' }) }),
            description: '책 리뷰를 작성합니다.',
            body: contentSchema,
            responses: {
                201: z.literal('리뷰가 작성되었습니다.'),
                // 아래외 같이 Schema 로 분리할 수 있다. schema.ts 에 어떤 타입인지 선언되어 있음
                404: bookInfoNotFoundSchema,
            },
        },
        //  다른 api 들의 계약서를 선언해준다
        ...

    },
    //  pathPrefix 를 통해 모든 경로에 공통적으로 /reviews 를 붙여줍니다.
    //  여러 api 마다 공통적으로 /reviews/~~~ 를 사용하니까 중복해서 선언하는 것을 방지하기 위함.
    { pathPrefix: '/reviews' },
);
```
### index.ts 설명
모든 contract 들을 모아서 하나의 contract 로 만드는 파일이다. contracts/src 경로에 존재한다.
```typescript title="index.ts"
import { initContract } from '@ts-rest/core';
import { reviewsContract } from './reviews';
import { historiesContract } from './histories';
import { usersContract } from './users';
import { likesContract } from './likes';
import { stockContract } from './stock';

export * from './reviews';
export * from './shared';

const c = initContract();

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
  {
    // likes: likesContract,
    reviews: reviewsContract,
    histories: historiesContract,

    stock: stockContract,
    // TODO(@scarf005): 유저 서비스 작성
//     users: usersContract,
  },
  {
    // 모든 경로는 /api/v2 로 들어오기 때문에 묶어서 관리한다.
    pathPrefix: '/api/v2',
    strictStatusCodes: true,
  },
);

```
