import { z } from "zod";
import { DEF_BATCH_SIZE } from "./data";

export const getItemsQuerySchema = z.object({
	filter: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.union([z.literal("-"), z.coerce.number().int()]).optional(),
	),
	limit: z.coerce.number().int().positive().default(DEF_BATCH_SIZE),
	latestId: z.coerce.number().optional(),
});

const basicSelectSchema = z.array(z.number());
export const selectItemsQuerySchema = basicSelectSchema;
export const unselectItemsQuerySchema = basicSelectSchema;

export const addItemsQuerySchema = z.array(z.number().int());

export const reorderItemSchema = z.object({
	id: z.coerce.number().int(),
	neighbourId: z.coerce.number().int(),
	side: z.union([z.literal("before"), z.literal("after")]),
});
export const sortItemsQuerySchema = z.array(reorderItemSchema);

export type TGetItemsQueryParams = z.infer<typeof getItemsQuerySchema>;
export type TSelectItemsQueryParams = z.infer<typeof selectItemsQuerySchema>;
export type TUnselectItemsQueryParams = z.infer<
	typeof unselectItemsQuerySchema
>;
export type TAddItemsQueryParams = z.infer<typeof addItemsQuerySchema>;
export type TReorderItem = z.infer<typeof reorderItemSchema>;
export type TSortItemsQueryParams = z.infer<typeof sortItemsQuerySchema>;
