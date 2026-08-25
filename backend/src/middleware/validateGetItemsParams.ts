import type { NextFunction, Request, Response } from "express";
import { getItemsQuerySchema, type TGetItemsQueryParams } from "../schemas";

export interface RequestWithItemsQuery extends Request {
	itemsQuery: TGetItemsQueryParams;
}

export function validateGetItemsParams(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const parsingResult = getItemsQuerySchema.safeParse(req.query);
	if (!parsingResult.success) {
		res.status(400).json({ error: parsingResult.error });
		return;
	}
	(req as RequestWithItemsQuery).itemsQuery = parsingResult.data;
	next();
}

export function hasItemsQuery(req: Request): req is RequestWithItemsQuery {
	return "itemsQuery" in req;
}
