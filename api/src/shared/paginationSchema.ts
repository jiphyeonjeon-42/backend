import { z } from "zod";

/**
 * 페이지네이션 정보를 담는 스키마
 */
export const paginationMetaSchema = z
  .object({
    currentPage: z.number().int().describe("현재 페이지"),
    itemCount: z.number().int().describe("현재 페이지 검색 결과 수"),
    itemsPerPage: z.number().int().describe("페이지 당 검색 결과 수"),
    totalItems: z.number().int().describe("전체 검색 결과 건수"),
    totalPages: z.number().int().describe("전체 페이지 수"),
  })
  .describe("페이지네이션 정보");

