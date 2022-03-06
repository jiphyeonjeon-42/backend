ALTER TABLE `book`
  ADD COLUMN
    `donatorId` int DEFAULT NULL,
  ADD CONSTRAINT `FK_donator_id_from_user`
    FOREIGN KEY (`donatorId`)
      REFERENCES `user`(`id`);