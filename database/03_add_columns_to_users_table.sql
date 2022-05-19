# user 테이블 수정
alter table user change login email varchar(255) NOT NULL after id;
alter table user add passwd varchar(255) NOT NULL after email;
alter table user change intra intraId int NULL;
alter table user add intraKey int NULL after intraId;
alter table user change slack slack varchar(255) NULL;
alter table user change librarian role int NOT NULL default 0 after penaltyAt;
alter table user change penaltyAt penaltyEndDay datetime NULL;