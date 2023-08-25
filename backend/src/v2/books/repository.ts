import { db } from "~/kysely/mod.ts";
import { executeWithOffsetPagination } from "kysely-paginate";
import { SqlBool } from "kysely";

import jipDataSource from "~/app-data-source";
import { VSearchBook } from "~/entity/entities";

export const vSearchBookRepo = jipDataSource.getRepository(VSearchBook)
