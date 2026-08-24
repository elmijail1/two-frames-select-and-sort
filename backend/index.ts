import express, { type Express } from "express";
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
import { getItemsQuerySchema } from "./src/schemas";

seedData();

const app: Express = express();
const PORT = process.env.PORT || "3000";

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.get("/seed", (_req, res) => {
	res.json(Array.from(itemsById.values()));
});

app.get("/items", (req, res) => {
	const parsedParams = getItemsQuerySchema.safeParse(req.query);
	if (!parsedParams.success) {
		res.status(400).json({ error: parsedParams.error });
		return;
	}
	const { selected, filter, limit, latestId } = parsedParams.data;

	if (selected) {
		const items = findSelectedItems({ latestId, filter, limit });
		res.json(items);
	} else {
		const items =
			filter !== undefined
				? findUnselectedItemsFiltered({ latestId, filter, limit })
				: findUnselectedItems({ latestId, limit });
		res.json(items);
	}
});

// TOREMOVE: for testing
app.post("/items/selected", (req, res) => {
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

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
