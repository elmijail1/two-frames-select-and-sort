import { z } from "zod";
import { DEF_BATCH_SIZE } from "./data";

export const getItemsQuerySchema = z.object({
	filter: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.coerce.number().int().optional(),
	),
	limit: z.coerce.number().int().positive().default(DEF_BATCH_SIZE),
	latestId: z.coerce.number().optional(),
});

const basicSelectSchema = z.array(z.number());
export const selectItemsQuerySchema = basicSelectSchema;
export const unselectItemsQuerySchema = basicSelectSchema;

export type TGetItemsQueryParams = z.infer<typeof getItemsQuerySchema>;
export type TSelectItemsQueryParams = z.infer<typeof selectItemsQuerySchema>;
export type TUnselectItemsQueryParams = z.infer<
	typeof unselectItemsQuerySchema
>;
