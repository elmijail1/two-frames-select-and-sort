import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateBody<T>(schema: ZodType<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const parsingResult = schema.safeParse(req.body);
		if (!parsingResult.success) {
			res.status(400).json({ error: parsingResult.error });
			return;
		}
		req.body = parsingResult.data;
		next();
	};
}
