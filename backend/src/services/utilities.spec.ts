import { beforeEach, describe, expect, it } from "vitest";
import { findFirstIndexGreaterThan, mergeSortedInsert } from "./utilities";

describe("findFirstIndexGreaterThan", () => {
	const basicArr = [10, 20, 30];
	it("returns 0 for an empty array", () => {
		expect(findFirstIndexGreaterThan([], 5)).toBe(0);
	});
	it("returns 0 when target is below the first element", () => {
		expect(findFirstIndexGreaterThan(basicArr, 5)).toBe(0);
	});
	it("returns length when target is above the last element", () => {
		expect(findFirstIndexGreaterThan(basicArr, 40)).toBe(basicArr.length);
	});
	it("returns the index after a matching element", () => {
		expect(findFirstIndexGreaterThan(basicArr, 10)).toBe(1);
		expect(findFirstIndexGreaterThan(basicArr, 20)).toBe(2);
		expect(findFirstIndexGreaterThan(basicArr, 30)).toBe(3);
	});
	it("returns the correct index when target falls between elements", () => {
		expect(findFirstIndexGreaterThan(basicArr, 25)).toBe(2);
	});
	it("handles a single-element array", () => {
		expect(findFirstIndexGreaterThan([10], 5)).toBe(0);
		expect(findFirstIndexGreaterThan([10], 10)).toBe(1);
		expect(findFirstIndexGreaterThan([10], 15)).toBe(1);
	});
});

describe("mergeSortedInsert", () => {
	const basicArr: number[] = [];
	beforeEach(() => {
		basicArr.length = 0;
		basicArr.push(...[10, 20, 30]);
	});
	it("merges when all new IDs are smaller than existing ones", () => {
		mergeSortedInsert(basicArr, [1, 2]);
		expect(basicArr).toEqual([1, 2, 10, 20, 30]);
	});
	it("merges when all new IDs are greater than existing ones", () => {
		mergeSortedInsert(basicArr, [40, 50]);
		expect(basicArr).toEqual([10, 20, 30, 40, 50]);
	});
	it("merges when newIds isn't pre-sorted", () => {
		mergeSortedInsert(basicArr, [25, 15]);
		expect(basicArr).toEqual([10, 15, 20, 25, 30]);
	});
	it("handles empty arrays", () => {
		mergeSortedInsert(basicArr, []);
		expect(basicArr).toEqual(basicArr);
		const emptyArr: number[] = [];
		mergeSortedInsert(emptyArr, [3, 1, 2]);
		expect(emptyArr).toEqual([1, 2, 3]);
	});
	it("ends with the expected length and no holes", () => {
		mergeSortedInsert(basicArr, [40, 50]);
		expect(basicArr.length).toBe(5);
		expect(basicArr.every((n) => typeof n === "number")).toBe(true);
	});
	it("merges fully interleaved IDs", () => {
		mergeSortedInsert(basicArr, [15, 25, 35, 45]);
		expect(basicArr).toEqual([10, 15, 20, 25, 30, 35, 45]);
	});
});
