import { z } from "zod";
import { DEF_BATCH_SIZE } from "./data";

export const getItemsQuerySchema = z.object({
	selected: z.enum(["true", "false"]).transform((v) => v === "true"),
	filter: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.coerce.number().int().optional(),
	),
	limit: z.coerce.number().int().positive().default(DEF_BATCH_SIZE),
	latestId: z.coerce.number().optional(),
});

export type TGetItemsQueryParams = z.infer<typeof getItemsQuerySchema>;
