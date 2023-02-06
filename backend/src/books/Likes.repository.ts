import { Repository } from "typeorm";
import jipDataSource from "../app-data-source";
import Likes from "../entity/entities/Likes";

class LikesRepository extends Repository<Likes> {
  constructor() {
    super(
      Likes,
      jipDataSource.createEntityManager(),
      jipDataSource.createQueryRunner()
    );
  }
}
