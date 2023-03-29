#에러 코드 (Error code)
### Common Error Code (0번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|0| UNKNOWN_ERROR |unknown error|
|1| QUERY_EXECUTION_FAILED |executeQuery SQL 에러|
|2| INVALID_INPUT |유효하지 않은 인자 (req , param, body에 잘못된 인자가 들어왔을 때)|
|42| CLIENT_AUTH_FAILED |Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.|

---

### Auth Error Code (100번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|100| NO_AUTHORIZATION |권한이 없을때|
|101| NO_USER |해당 토큰의 유저가 DB에 없을때|
|102| NO_TOKEN |토큰이 발급되지 않았을때|
|103| NO_INPUT |로그인시 ID, PW 파라미터가 없을때|
|104| WRONG_PASSWORD |비밀번호가 일치하지 않을때(로그인 실패)|
|105| ALREADY_AUTHENTICATED |이미 인증된 회원의 경우(또 인증할 경우)|
|107| NO_ID |해당 ID가 존재하지 않을때(로그인 실패)|
|108| EXPIRATION_TOKEN |토큰이 만료되었을 경우|
|109| TOKEN_NOT_VALID |토큰이 유효하지 않을때|
|110| NON_AFFECTED |UPDATE 실패|
|111| ANOTHER_ACCOUNT_AUTHENTICATED |다른 계정에 이미 42 intra가 연동되어 있는 경우 <br/> (105번은 이미 인증된 회원인 경우이고 111번은 42 계정을 다른 계정에 또 연결하는 경우)|
|112| ACCESS_DENIED |42 API 사용에 대해 동의를 하지 않았을 경우|

---

### User Error Code (200번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|203| EMAIL_OVERLAP |email 중복. (이미 있는 email 로 가입)|
|204| NICKNAME_OVERLAP |nickname 중복. (이미 있는 nickname 입력)|
|205| INVALIDATE_PASSWORD |잘못된 password 형식|
|206| INVALID_ROLE |유효하지 않은 role 값입니다.|
|207| SLACK_OVERLAP |슬랙 ID가 중복|
|208| INTRA_AUTHENTICATE_SUCCESS |42 인증 완료 ( 에러 메세지는 아닌데, 인증 완료시 Front한테 상태값을 전달해서 메세지를 띄우기 위한 코드 입니다 )|

---

### Books Error Code (300번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|301| SLACKID_OVERLAP | 슬랙 ID가 중복됨 |
|302| NO_ISBN | 네이버 Open API에서 ISBN검색 결과가 없음 |
|303| ISBN_SEARCH_FAILED | 국립중앙 도서관 API에서 ISBN 검색이 실패 |
|304| NO_BOOK_INFO_ID | book_info table에 존재하지 않는 ID를 조회하려고 함 |
|305| CALL_SIGN_OVERLAP |등록하려는 callSign는 이미 있는 callSign임|
|306| INVALID_CALL_SIGN |유효하지 않는 callsign|
|307| NO_BOOK_ID |없는 BOOK_ID를 조회하려고 함|
|308| FAIL_CREATE_BOOK_BY_UNEXPECTED | 예상치 못한 에러로 책 정보 insert에 실패함 |
|309| INVALID_CATEGORY_ID | 보내준 카테고리 ID에 해당하는 callsign을 찾을 수 없음 |
|310| ISBN_SEARCH_FAILED_IN_NAVER | 네이버 Open API에서 ISBN검색 자체가 실패함 |
|311| INVALID_PUBDATE_FORNAT | 입력한 pubdate가 알맞은 형식이 아님. 기대하는 형식 "20220807" |
|312| FAIL_PATCH_BOOK_BY_UNEXPECTED | 예상치 못한 에러로 bookInfo patch 가 실패함 |
|313| NO_BOOK_INFO_DATA | 입력한 data가 없음(적어도 하나의 데이터는 필수) |

---

### Lendings Error Code (400번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|401| NO_USER_ID | 유저 없음 |
|402| NO_PERMISSION | 권환 없음 |
|403| LENDING_OVERLOAD |2권 이상 대출|
|404| LENDING_OVERDUE |연체 중|
|405| ON_LENDING |대출 중|
|406| ON_RESERVATION |예약된 책|
|407| LOST_BOOK |분실된 책|
|408| DAMAGED_BOOK |파손된 책|
|410| NONEXISTENT_LENDING |존재하지 않는 대출|
|411| ALREADY_RETURNED |이미 반납 처리된 대출|

---

### Reservation Error Code (500번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|501| INVALID_INFO_ID |book_info_id가 유효하지 않음|
|502| AT_PENALTY |대출 제한 중|
|503| NOT_LENDED |대출 가능|
|504| ALREADY_RESERVED |이미 예약 중|
|505| ALREADY_LENDED |이미 대출 중|
|506| MORE_THAN_TWO_RESERVATIONS |두 개 이상 예약 중|
|507| NO_MATCHING_USER |해당 유저 아님|
|508| RESERVATION_NOT_EXIST |예약 ID 존재하지 않음|
|509| NOT_RESERVED |예약 상태가 아님|

---

### Likes (600번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|601| INVALID_INFO_ID_LIKES    | bookInfoId가 유효하지 않음 |
|602| ALREADY_LIKES      | 좋아요 데이터가 이미 존재함   |
|603| NONEXISTENT_LIKES  | bookInfoId가 유효하지 않음 |

---

### history (700번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|700| UNAUTHORIZED | 사서권한이 없는 사람이 모든 대출/반납 기록을 조회하려고함 |


---

### reviews (800번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|800| INVALID_INPUT_REVIEWS | 유효하지 않은 양식의 reviews |
|801| UNAUTHORIZED_REVIEWS | reviews를 수정/삭제할 권한이 없음 |
|804| NOT_FOUND_REVIEWS | 존재하지 않는 reviewsId |
|805| DISABLED_REVIEWS | Disabled 된 review |
|810| INVALID_INPUT_REVIEWS_ID | 유효하지 않은 양식의 reviewsId |
|811| INVALID_INPUT_REVIEWS_CONTENT | 유효하지 않은 양식의 reviews content |

---

### tags (900번대)
|Error Code|Constant Name|Description|
|:----------:|:-------------|:-----------|
|900| INVALID_INPUT_TAGS | 유효하지 않은 양식의 tags |
|901| UNAUTHORIZED_TAGS | tags를 수정/삭제할 권한이 없음 |
|902| ALREADY_EXISTING_TAGS | 이미 존재하는 내용의 태그 |
|904| NOT_FOUND_TAGS | 존재하지 않는 tagId |
|910| INVALID_INPUT_TAG_ID | 유효하지 않은 양식의 tagId |

---