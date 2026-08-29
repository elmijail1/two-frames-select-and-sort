import { beforeEach, describe, expect, it } from "vitest";
import {
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsUniqueValues,
} from "../data";
import { sortItems } from "./sortItems";

const INIT_SELECTED_ARR = [1, 2, 3, 4, 5];

function resetState() {
	selectedIdsOrder.length = 0;
	selectedIdsOrder.push(...INIT_SELECTED_ARR);
	selectedIdsUniqueValues.clear();
	for (const id of INIT_SELECTED_ARR) selectedIdsUniqueValues.add(id);

	unselectedIdsUniqueValues.clear();
}

function expectNoItemsLost() {
	expect(selectedIdsOrder.length).toBe(INIT_SELECTED_ARR.length);
	for (const id of INIT_SELECTED_ARR) {
		expect(selectedIdsOrder.includes(id)).toBe(true);
	}
}

describe("sortItems", () => {
	beforeEach(resetState);

	it("moves an item forward, placing it after its new neighbour", () => {
		const result = sortItems([{ id: 1, neighbourId: 3, side: "after" }]);
		expect(result).toEqual({ reordered: [{ id: 1, neighbourId: 3, side: "after" }], failed: [], totalItems: 1 });
		expect(selectedIdsOrder).toEqual([2, 3, 1, 4, 5]);
		expectNoItemsLost();
	});

	it("moves an item backward, placing it before its new neighbour", () => {
		sortItems([{ id: 5, neighbourId: 2, side: "before" }]);
		expect(selectedIdsOrder).toEqual([1, 5, 2, 3, 4]);
		expectNoItemsLost();
	});

	it("moves an item forward relative to its immediately adjacent neighbour", () => {
		sortItems([{ id: 1, neighbourId: 2, side: "after" }]);
		expect(selectedIdsOrder).toEqual([2, 1, 3, 4, 5]);
		expectNoItemsLost();
	});

	it("moves an item backward relative to its immediately adjacent neighbour", () => {
		sortItems([{ id: 2, neighbourId: 1, side: "before" }]);
		expect(selectedIdsOrder).toEqual([2, 1, 3, 4, 5]);
		expectNoItemsLost();
	});

	it("places an item after the last element", () => {
		sortItems([{ id: 1, neighbourId: 5, side: "after" }]);
		expect(selectedIdsOrder).toEqual([2, 3, 4, 5, 1]);
		expectNoItemsLost();
	});

	it("places an item before the first element", () => {
		sortItems([{ id: 5, neighbourId: 1, side: "before" }]);
		expect(selectedIdsOrder).toEqual([5, 1, 2, 3, 4]);
		expectNoItemsLost();
	});

	it("fails when id equals neighbourId and leaves selectedIdsOrder untouched", () => {
		const result = sortItems([{ id: 3, neighbourId: 3, side: "after" }]);
		expect(result.reordered).toEqual([]);
		expect(result.failed).toEqual([{ id: 3, neighbourId: 3, side: "after" }]);
		expect(selectedIdsOrder).toEqual(INIT_SELECTED_ARR);
		expectNoItemsLost();
	});

	it("fails and rolls back when the neighbour doesn't exist", () => {
		const result = sortItems([{ id: 2, neighbourId: 999, side: "after" }]);
		expect(result.failed).toEqual([{ id: 2, neighbourId: 999, side: "after" }]);
		expect(selectedIdsOrder).toEqual(INIT_SELECTED_ARR);
		expectNoItemsLost();
	});

	it("fails when id isn't in the selected set", () => {
		const result = sortItems([{ id: 999, neighbourId: 2, side: "after" }]);
		expect(result.failed).toEqual([{ id: 999, neighbourId: 2, side: "after" }]);
		expect(selectedIdsOrder).toEqual(INIT_SELECTED_ARR);
	});

	it("fails when id is present in unselectedIdsUniqueValues", () => {
		unselectedIdsUniqueValues.add(2);
		const result = sortItems([{ id: 2, neighbourId: 4, side: "after" }]);
		expect(result.failed).toEqual([{ id: 2, neighbourId: 4, side: "after" }]);
		expect(selectedIdsOrder).toEqual(INIT_SELECTED_ARR);
	});

	it("partitions a mixed batch into reordered and failed", () => {
		const result = sortItems([
			{ id: 1, neighbourId: 5, side: "after" },
			{ id: 3, neighbourId: 3, side: "after" },
			{ id: 999, neighbourId: 2, side: "before" },
		]);
		expect(result.reordered).toEqual([{ id: 1, neighbourId: 5, side: "after" }]);
		expect(result.failed).toEqual([
			{ id: 3, neighbourId: 3, side: "after" },
			{ id: 999, neighbourId: 2, side: "before" },
		]);
		expect(result.totalItems).toBe(3);
		expect(selectedIdsOrder).toEqual([2, 3, 4, 5, 1]);
		expectNoItemsLost();
	});

	it("applies sequential reorders within one batch in order", () => {
		sortItems([
			{ id: 1, neighbourId: 5, side: "after" },
			{ id: 2, neighbourId: 1, side: "after" },
		]);
		expect(selectedIdsOrder).toEqual([3, 4, 5, 1, 2]);
		expectNoItemsLost();
	});
});
