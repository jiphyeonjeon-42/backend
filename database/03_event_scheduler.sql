DROP EVENT IF EXISTS update_reservation_status;

CREATE EVENT update_reservation_status
ON SCHEDULE EVERY 1 DAY
STARTS '2022-05-24 00:00:00' ON COMPLETION PRESERVE ENABLE
DO UPDATE reservation set status = 3 where (status = 0 and endAt <= NOW());

SET GLOBAL event_scheduler = ON;