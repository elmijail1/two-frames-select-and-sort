import express, { Router, type Express } from "express";
import { itemsById, seedData } from "./src/data";
import {
	findSelectedItems,
	findUnselectedItems,
	findUnselectedItemsFiltered,
} from "./src/services/findItems";
import {
	hasItemsQuery,
	validateGetItemsParams,
} from "./src/middleware/validateGetItemsParams";
import { selectItems, unselectItems } from "./src/services/selectItems";
import {
	selectItemsQuerySchema,
	unselectItemsQuerySchema,
} from "./src/schemas";

seedData();

const app: Express = express();
const apiRouter = Router();
const PORT = process.env.PORT || "3000";

app.use(express.json());

apiRouter.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

apiRouter.get("/seed", (_req, res) => {
	res.json(Array.from(itemsById.values()));
});

apiRouter.get("/items/unselected", validateGetItemsParams, (req, res) => {
	if (!hasItemsQuery(req)) {
		res.status(500).json({ error: "Validator's unexpected behavior" });
		return;
	}
	const { filter, limit, latestId } = req.itemsQuery;
	const items =
		filter !== undefined
			? findUnselectedItemsFiltered({ latestId, filter, limit })
			: findUnselectedItems({ latestId, limit });
	res.json(items);
});

apiRouter.get("/items/selected", validateGetItemsParams, (req, res) => {
	if (!hasItemsQuery(req)) {
		res.status(500).json({ error: "Validator's unexpected behavior" });
		return;
	}
	const { filter, limit, latestId } = req.itemsQuery;
	const items = findSelectedItems({ latestId, filter, limit });
	res.json(items);
});

apiRouter.post("/items/selected/batch", (req, res) => {
	const parsingResult = selectItemsQuerySchema.safeParse(req.body);
	if (!parsingResult.success) {
		res.status(400).json({ error: parsingResult.error });
		return;
	}
	const result = selectItems(parsingResult.data);
	res.json(result);
});

apiRouter.post("/items/unselected/batch", (req, res) => {
	const parsingResult = unselectItemsQuerySchema.safeParse(req.body);
	if (!parsingResult.success) {
		res.status(400).json({ error: parsingResult.error });
		return;
	}
	const result = unselectItems(parsingResult.data);
	res.json(result);
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
