import type { IItem } from "./types";

const SEED_COUNT = 200;

export const itemsById: Map<number, IItem> = new Map();
const selectedOrderIds: number[] = [];
const selectedIds: Set<number> = new Set();

export function seedData(count: number = SEED_COUNT): void {
	itemsById.clear();
	selectedOrderIds.length = 0;
	selectedIds.clear();

	for (let id = 1; id <= count; id++) {
		itemsById.set(id, { id });
	}
}
