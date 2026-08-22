import express, { type Express } from "express";

const app: Express = express();
const PORT = process.env.PORT || "3000";

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
