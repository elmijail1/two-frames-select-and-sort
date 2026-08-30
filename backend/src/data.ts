import type { IItem } from "./types";

const SEED_COUNT = 1_000_000;
export const DEF_BATCH_SIZE = 20;
export const UPDATE_INTERVAL_MS = 1_000;

export const itemsById: Map<number, IItem> = new Map();
export const selectedIdsOrder: number[] = [];
export const selectedIdsUniqueValues: Set<number> = new Set();
export const unselectedIdsOrder: number[] = [];
export const unselectedIdsUniqueValues: Set<number> = new Set();

export function seedData(count: number = SEED_COUNT): void {
	itemsById.clear();
	selectedIdsOrder.length = 0;
	selectedIdsUniqueValues.clear();

	for (let id = 1; id <= count; id++) {
		itemsById.set(id, { id });
		unselectedIdsOrder.push(id);
		unselectedIdsUniqueValues.add(id);
	}
}
