import express, { type Express } from "express";
import { itemsById, seedData } from "./src/data";
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
	const result = getItemsQuerySchema.safeParse(req.query);
	if (!result.success) {
		res.status(400).json({ error: result.error });
		return;
	}
	const { selected, filter, limit, latestId } = result.data;

	if (selected) {
		const items = findSelectedItems({ latestId, filter, limit });
		res.json(items);
	} else {
		const items = filter
			? findUnselectedItemsFiltered({ latestId, filter, limit })
			: findUnselectedItems({ latestId, limit });
		res.json(items);
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
