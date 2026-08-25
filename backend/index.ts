import express, { Router, type Express } from "express";
import {
	itemsById,
	seedData,
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "./src/data";
import {
	findSelectedItems,
	findUnselectedItems,
	findUnselectedItemsFiltered,
} from "./src/services/findItems";
import {
	hasItemsQuery,
	validateGetItemsParams,
} from "./src/middleware/validateGetItemsParams";

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

// TOREMOVE: for testing
apiRouter.post("/items/selected", (req, res) => {
	console.log(req.body);
	const { items } = req.body ? req.body : [];
	for (const item of items) {
		selectedIdsOrder.push(item.id);
		selectedIdsUniqueValues.add(item.id);
		unselectedIdsUniqueValues.delete(item.id);
		const ind = unselectedIdsOrder.indexOf(item.id);
		unselectedIdsOrder.splice(ind, 1);
	}
	console.log("selectedIdsOrder: ", selectedIdsOrder);
	res.json(items);
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
