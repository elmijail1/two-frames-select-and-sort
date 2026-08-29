import { beforeEach, describe, expect, it } from "vitest";
import {
	itemsById,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import { addItems } from "./addItems";

const INIT_UNSELECTED_ARR = [10, 20, 30, 40, 50];

function expectSorted(arr: number[]) {
	for (let i = 1; i < arr.length; i++) {
		expect(arr[i]).toBeGreaterThan(arr[i - 1]);
	}
}

function expectInSync() {
	expect(unselectedIdsOrder.length).toBe(unselectedIdsUniqueValues.size);
	unselectedIdsOrder.forEach((id) => {
		expect(unselectedIdsUniqueValues.has(id)).toBe(true);
	});
}

describe("addItems", () => {
	beforeEach(() => {
		itemsById.clear();
		INIT_UNSELECTED_ARR.forEach((id) => {
			itemsById.set(id, { id });
		});

		unselectedIdsOrder.length = 0;
		unselectedIdsOrder.push(...INIT_UNSELECTED_ARR);
		unselectedIdsUniqueValues.clear();
		INIT_UNSELECTED_ARR.forEach((id) => {
			unselectedIdsUniqueValues.add(id);
		});

		selectedIdsUniqueValues.clear();
	});

	it("adds a single new ID via the loop-splice path", () => {
		const result = addItems([25]);
		expect(result).toEqual({ added: [25], failed: [], totalIds: 1 });
		expect(unselectedIdsOrder).toEqual([10, 20, 25, 30, 40, 50]);
		expect(unselectedIdsUniqueValues.has(25)).toBe(true);
		expect(itemsById.has(25)).toBe(true);
		expectInSync();
	});

	it("adds an ID smaller than everything else (front boundary)", () => {
		addItems([5]);
		expect(unselectedIdsOrder).toEqual([5, 10, 20, 30, 40, 50]);
		expectInSync();
	});

	it("adds an ID larger than everything else (end boundary)", () => {
		addItems([60]);
		expect(unselectedIdsOrder).toEqual([10, 20, 30, 40, 50, 60]);
		expectInSync();
	});

	it("adds a K=3 batch via the loop-splice path and keeps order sorted", () => {
		const result = addItems([25, 5, 45]);
		expect(result.added).toEqual([25, 5, 45]);
		expect(unselectedIdsOrder).toEqual([5, 10, 20, 25, 30, 40, 45, 50]);
		expectSorted(unselectedIdsOrder);
		expectInSync();
	});

	it("adds a K=4+ batch via the mergeSortedInsert path", () => {
		const result = addItems([25, 5, 45, 35]);
		expect(result.added).toEqual([25, 5, 45, 35]);
		expect(unselectedIdsOrder).toEqual([5, 10, 20, 25, 30, 35, 40, 45, 50]);
		expect(unselectedIdsOrder.length).toBe(9); // regression guard for the stale-preallocation bug
		expectSorted(unselectedIdsOrder);
		expectInSync();
	});

	it("fails an ID that already exists in itemsById", () => {
		const result = addItems([10]);
		expect(result).toEqual({ added: [], failed: [10], totalIds: 1 });
		expect(unselectedIdsOrder).toEqual(INIT_UNSELECTED_ARR);
	});

	it("fails an ID that's already selected", () => {
		itemsById.set(99, { id: 99 });
		selectedIdsUniqueValues.add(99);
		const result = addItems([99]);
		expect(result).toEqual({ added: [], failed: [99], totalIds: 1 });
		expect(unselectedIdsUniqueValues.has(99)).toBe(false);
	});

	it("partitions a mixed batch into added and failed", () => {
		const result = addItems([25, 10, 45, 999]);
		expect(result.added).toEqual([25, 45, 999]);
		expect(result.failed).toEqual([10]);
		expect(unselectedIdsOrder).toEqual([10, 20, 25, 30, 40, 45, 50, 999]);
		expectInSync();
	});
});
