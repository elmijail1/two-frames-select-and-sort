import express, { type Express } from "express";
import { itemsById, seedData } from "./src/data";

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

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
