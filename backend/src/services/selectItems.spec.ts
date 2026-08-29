import { beforeEach, describe, expect, it } from "vitest";
import {
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import { selectItems, unselectItems } from "./selectItems";

const INIT_UNSELECTED_ARR = [1, 2, 3, 4, 5];

function expectInSync() {
	expect(unselectedIdsOrder.length).toBe(unselectedIdsUniqueValues.size);
	unselectedIdsOrder.forEach((id) => {
		expect(unselectedIdsUniqueValues.has(id)).toBe(true);
	});
	expect(selectedIdsOrder.length).toBe(selectedIdsUniqueValues.size);
	selectedIdsOrder.forEach((id) => {
		expect(selectedIdsUniqueValues.has(id)).toBe(true);
	});
}

function expectSorted(arr: number[]) {
	for (let i = 1; i < arr.length; i++) {
		expect(arr[i]).toBeGreaterThan(arr[i - 1]);
	}
}

describe("selectItems", () => {
	beforeEach(() => {
		unselectedIdsOrder.length = 0;
		unselectedIdsOrder.push(...INIT_UNSELECTED_ARR);
		unselectedIdsUniqueValues.clear();
		INIT_UNSELECTED_ARR.forEach((id) => {
			unselectedIdsUniqueValues.add(id);
		});
		selectedIdsOrder.length = 0;
		selectedIdsUniqueValues.clear();
	});

	it("selects a single ID", () => {
		const result = selectItems([3]);
		expect(result).toEqual({ added: [3], failed: [], totalIds: 1 });
		expect(unselectedIdsOrder).toEqual([1, 2, 4, 5]);
		expect(unselectedIdsUniqueValues.has(3)).toBe(false);
		expect(selectedIdsOrder).toEqual([3]);
		expect(selectedIdsUniqueValues.has(3)).toBe(true);
		expectInSync();
	});
	it("selects the border IDs in unselectedIdsOrder", () => {
		selectItems([1, 5]);
		expect(unselectedIdsOrder).toEqual([2, 3, 4]);
		selectItems([2]);
		expect(unselectedIdsOrder).toEqual([3, 4]);
		selectItems([4]);
		expect(unselectedIdsOrder).toEqual([3]);
		expectInSync();
	});
	it("selects multiple IDs and keeps unselectedIdsOrder sorted", () => {
		const result = selectItems([4, 1, 3]);
		expect(result.added).toEqual([4, 1, 3]);
		expect(result.failed).toEqual([]);
		expect(unselectedIdsOrder).toEqual([2, 5]);
		expectSorted(unselectedIdsOrder);
		expectInSync();
	});
	it("preserves selection order in selectedIdsOrder, not sorted order", () => {
		selectItems([5, 1, 3]);
		expect(selectedIdsOrder).toEqual([5, 1, 3]);
	});
	it("fails an ID that is already selected", () => {
		selectItems([2]);
		const result = selectItems([2]);
		expect(result).toEqual({ added: [], failed: [2], totalIds: 1 });
		expectInSync();
	});
	it("fails an ID that isn't present in unselected", () => {
		const result = selectItems([999]);
		expect(result).toEqual({ added: [], failed: [999], totalIds: 1 });
		expect(unselectedIdsOrder).toEqual(INIT_UNSELECTED_ARR);
		expect(selectedIdsOrder).toEqual([]);
	});
	it("partitions a mixed batch into added and failed", () => {
		selectItems([2]);
		const result = selectItems([2, 4, 999]);
		expect(result.added).toEqual([4]);
		expect(result.failed).toEqual([2, 999]);
		expect(unselectedIdsOrder).toEqual([1, 3, 5]);
		expect(selectedIdsOrder).toEqual([2, 4]);
		expectInSync();
	});
	it("round-trips with unselectItems back to the original state", async () => {
		selectItems([2, 4]);
		unselectItems([2, 4]);
		expect(unselectedIdsOrder).toEqual(INIT_UNSELECTED_ARR);
		expect(selectedIdsOrder).toEqual([]);
		expectInSync();
	});
});

describe("unselectItems", () => {
	const INIT_SELECTED_ARR = [5, 1, 3, 2, 4];
	const INIT_UNSELECTED_ARR_FOR_UNSELECT = [10, 20, 30];

	beforeEach(() => {
		selectedIdsOrder.length = 0;
		selectedIdsOrder.push(...INIT_SELECTED_ARR);
		selectedIdsUniqueValues.clear();
		INIT_SELECTED_ARR.forEach((id) => {
			selectedIdsUniqueValues.add(id);
		});

		unselectedIdsOrder.length = 0;
		unselectedIdsOrder.push(...INIT_UNSELECTED_ARR_FOR_UNSELECT);
		unselectedIdsUniqueValues.clear();
		INIT_UNSELECTED_ARR_FOR_UNSELECT.forEach((id) => {
			unselectedIdsUniqueValues.add(id);
		});
	});

	it("unselects a single ID from the middle of selectedIdsOrder", () => {
		const result = unselectItems([3]);
		expect(result).toEqual({ added: [3], failed: [], totalIds: 1 });
		expect(selectedIdsOrder).toEqual([5, 1, 2, 4]);
		expect(unselectedIdsOrder).toEqual([3, 10, 20, 30]);
		expectSorted(unselectedIdsOrder);
		expectInSync();
	});

	it("unselects the first and last elements of selectedIdsOrder", () => {
		unselectItems([5]);
		unselectItems([4]);
		expect(selectedIdsOrder).toEqual([1, 3, 2]);
		expectInSync();
	});

	it("unselects a K=2 batch via the loop-splice insert path", () => {
		unselectItems([1, 4]);
		expect(unselectedIdsOrder).toEqual([1, 4, 10, 20, 30]);
		expectSorted(unselectedIdsOrder);
		expectInSync();
	});

	it("unselects a K>3 batch via the mergeSortedInsert path", () => {
		unselectItems([5, 1, 3, 2]);
		expect(unselectedIdsOrder).toEqual([1, 2, 3, 5, 10, 20, 30]);
		expectSorted(unselectedIdsOrder);
		expect(selectedIdsOrder).toEqual([4]);
		expectInSync();
	});

	it("preserves relative order of survivors when unselecting scattered IDs", () => {
		unselectItems([1, 4]);
		expect(selectedIdsOrder).toEqual([5, 3, 2]);
	});

	it("fails an ID that is already unselected", () => {
		const result = unselectItems([10]);
		expect(result).toEqual({ added: [], failed: [10], totalIds: 1 });
		expectInSync();
	});

	it("fails an ID that isn't present in selected", () => {
		const result = unselectItems([999]);
		expect(result).toEqual({ added: [], failed: [999], totalIds: 1 });
		expect(selectedIdsOrder).toEqual(INIT_SELECTED_ARR);
	});

	it("partitions a mixed batch into added and failed", () => {
		const result = unselectItems([5, 10, 999]);
		expect(result.added).toEqual([5]);
		expect(result.failed).toEqual([10, 999]);
		expect(selectedIdsOrder).toEqual([1, 3, 2, 4]);
		expectInSync();
	});
});
