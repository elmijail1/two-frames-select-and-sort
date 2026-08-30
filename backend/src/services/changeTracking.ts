import type { Response } from "express";
import { UPDATE_INTERVAL_MS } from "../data";

const clients = new Set<Response>();
let unselectedDirty = false;
let selectedDirty = false;
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
	if (flushTimeout !== null) return;
	flushTimeout = setTimeout(flush, UPDATE_INTERVAL_MS);
}

function flush() {
	flushTimeout = null;
	if (unselectedDirty) {
		broadcast("unselected-changed");
		unselectedDirty = false;
	}
	if (selectedDirty) {
		broadcast("selected-changed");
		selectedDirty = false;
	}
}

export function markUnselectedDirty() {
	unselectedDirty = true;
	scheduleFlush();
}
export function markSelectedDirty() {
	selectedDirty = true;
	scheduleFlush();
}

export function registerClient(res: Response) {
	clients.add(res);
}
export function unregisterClient(res: Response) {
	clients.delete(res);
}

function broadcast(event: string) {
	for (const res of clients) {
		res.write(`event: ${event}\ndata: {}\n\n`);
	}
}
