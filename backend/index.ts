import path from "node:path";
import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import { seedData } from "./src/data";
import { validateBody } from "./src/middleware/validateBody";
import {
	hasItemsQuery,
	validateGetItemsParams,
} from "./src/middleware/validateGetItemsParams";
import {
	addItemsQuerySchema,
	selectItemsQuerySchema,
	sortItemsQuerySchema,
	unselectItemsQuerySchema,
} from "./src/schemas";
import { addItems } from "./src/services/addItems";
import {
	registerClient,
	unregisterClient,
} from "./src/services/changeTracking";
import {
	findSelectedItems,
	findUnselectedItems,
	findUnselectedItemsFiltered,
} from "./src/services/findItems";
import { selectItems, unselectItems } from "./src/services/selectItems";
import { sortItems } from "./src/services/sortItems";

seedData();

const app: Express = express();
const apiRouter = Router();
const PORT = process.env.PORT || "3000";

app.use(express.json());

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

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

apiRouter.post(
	"/items/selected/batch",
	validateBody(selectItemsQuerySchema),
	(req, res) => {
		const result = selectItems(req.body);
		res.json(result);
	},
);

apiRouter.post(
	"/items/unselected/batch",
	validateBody(unselectItemsQuerySchema),
	(req, res) => {
		const result = unselectItems(req.body);
		res.json(result);
	},
);

apiRouter.post(
	"/items/batch",
	validateBody(addItemsQuerySchema),
	(req, res) => {
		const result = addItems(req.body);
		res.json(result);
	},
);

apiRouter.post(
	"/items/selected/reorder/batch",
	validateBody(sortItemsQuerySchema),
	(req, res) => {
		const result = sortItems(req.body);
		res.json(result);
	},
);

apiRouter.get("/events", (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});
	res.write("\n");
	registerClient(res);
	req.on("close", () => unregisterClient(res));
});

app.use("/api", apiRouter);
app.use((_req, res) => {
	res.sendFile(path.join(frontendDist, "index.html"));
});

app.use(
	(
		err: Error & { status?: number },
		_req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		res.status(err.status ?? 500).json({ error: err.message });
	},
);

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
