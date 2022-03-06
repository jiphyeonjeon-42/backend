ALTER TABLE `book`
  DROP COLUMN
    `donatorId`,
  DROP CONSTRAINT `FK_donator_id_from_user`;