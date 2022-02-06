ALTER TABLE `book_info`
  RENAME COLUMN `category` TO `categoryEnum`,
  MODIFY COLUMN `categoryEnum` varchar(255);

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT UNIQUE PRIMARY KEY,
  `categoryName` varchar(255) NOT NULL UNIQUE
);

ALTER TABLE `book_info`
  ADD COLUMN (
    categoryId int
  ),
  ADD FOREIGN KEY (`categoryId`)
    REFERENCES `category` (`id`);


DROP PROCEDURE IF EXISTS category_reseting;

DELIMITER $$

CREATE PROCEDURE category_reseting()
BEGIN
  DECLARE n int DEFAULT 0;
  DECLARE i int DEFAULT 0;
  DECLARE cateId int DEFAULT -1;
  SELECT COUNT(*) FROM `book_info` INTO n;
  SET i = 0;
  WHILE i < n DO
    WITH `cid` AS (
      SELECT `id`
        FROM `category`
      WHERE
        `categoryName` = (
          SELECT `categoryEnum`
            FROM `book_info`
          WHERE `id` = i
        )
    )
    SELECT IF((SELECT COUNT(*) FROM `cid`) = 1, `cid`.`id`, -1) INTO cateId;
    IF cateId = -1 THEN
      INSERT INTO `category`(`categoryName`)
        VALUES (
          (
            SELECT `categoryEnum`
              FROM `book_info`
            WHERE `id` = i
          )
        );
      UPDATE `book_info`
        SET `categoryId` = LAST_INSERT_ID()
        WHERE `id` = i;
    ELSE
      UPDATE `book_info`
        SET `categoryId` = cateId
        WHERE `id` = i;
    END IF;
  SET i = i + 1;
  END WHILE;
END $$

DELIMITER ;
