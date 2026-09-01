import { beforeEach, describe, expect, it } from "vitest";
import {
	itemsById,
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import {
	findSelectedItems,
	findUnselectedItems,
	findUnselectedItemsFiltered,
} from "./findItems";

const UNSELECTED_IDS = [
	-2299, -2290, -229, -220, -22, -21, -5, -1, 0, 1, 5, 12, 22, 220, 221, 225,
	229, 230, 999, 2200, 2205, 3000,
];
const SELECTED_IDS = [50, 60, 70];

function ids(items: { id: number }[]) {
	return items.map((item) => item.id);
}

function resetState() {
	itemsById.clear();
	for (const id of [...UNSELECTED_IDS, ...SELECTED_IDS]) {
		itemsById.set(id, { id });
	}

	unselectedIdsOrder.length = 0;
	unselectedIdsOrder.push(...UNSELECTED_IDS);
	unselectedIdsUniqueValues.clear();
	for (const id of UNSELECTED_IDS) unselectedIdsUniqueValues.add(id);

	selectedIdsOrder.length = 0;
	selectedIdsOrder.push(...SELECTED_IDS);
	selectedIdsUniqueValues.clear();
	for (const id of SELECTED_IDS) selectedIdsUniqueValues.add(id);
}

describe("findSelectedItems", () => {
	beforeEach(resetState);

	it("returns selected items in order, paginating via latestId", () => {
		const first = findSelectedItems({ limit: 2 });
		expect(ids(first.items)).toEqual([50, 60]);
		expect(first.newLatestId).toBe(60);

		const second = findSelectedItems({ limit: 2, latestId: 60 });
		expect(ids(second.items)).toEqual([70]);
		expect(second.newLatestId).toBe(null);
	});

	it("filters by id prefix", () => {
		const result = findSelectedItems({ limit: 10, filter: 5 });
		expect(ids(result.items)).toEqual([50]);
	});

	it("skips an id left over in selectedIdsOrder that's actually unselected", () => {
		unselectedIdsUniqueValues.add(60); // simulates a stale/leftover entry
		const result = findSelectedItems({ limit: 10 });
		expect(ids(result.items)).toEqual([50, 70]);
	});

	it("skips an id in selectedIdsOrder no longer in selectedIdsUniqueValues", () => {
		selectedIdsUniqueValues.delete(60);
		const result = findSelectedItems({ limit: 10 });
		expect(ids(result.items)).toEqual([50, 70]);
	});

	it("returns an empty page when there's nothing left after latestId", () => {
		const result = findSelectedItems({ limit: 10, latestId: 70 });
		expect(result).toEqual({ items: [], newLatestId: null });
	});
});

describe("findUnselectedItems", () => {
	beforeEach(resetState);

	it("returns unselected items in ascending order, paginating via latestId", () => {
		const first = findUnselectedItems({ limit: 3 });
		expect(ids(first.items)).toEqual([-2299, -2290, -229]);
		expect(first.newLatestId).toBe(-229);

		const second = findUnselectedItems({ limit: 3, latestId: -229 });
		expect(ids(second.items)).toEqual([-220, -22, -21]);
	});

	it("skips an id in unselectedIdsOrder no longer in unselectedIdsUniqueValues", () => {
		unselectedIdsUniqueValues.delete(-2290);
		const result = findUnselectedItems({ limit: 3 });
		expect(ids(result.items)).toEqual([-2299, -229, -220]);
	});

	it("skips an id present in both order arrays due to a stale selected flag", () => {
		selectedIdsUniqueValues.add(-2290);
		const result = findUnselectedItems({ limit: 3 });
		expect(ids(result.items)).toEqual([-2299, -229, -220]);
	});

	it("returns an empty page once everything has been paginated through", () => {
		const result = findUnselectedItems({
			limit: 10,
			latestId: UNSELECTED_IDS[UNSELECTED_IDS.length - 1],
		});
		expect(result).toEqual({ items: [], newLatestId: null });
	});
});

describe("findUnselectedItemsFiltered", () => {
	beforeEach(resetState);

	describe("filter === 0", () => {
		it("returns the zero item when not yet delivered", () => {
			const result = findUnselectedItemsFiltered({ limit: 10, filter: 0 });
			expect(result).toEqual({ items: [{ id: 0 }], newLatestId: 0 });
		});

		it("returns nothing once zero has already been delivered", () => {
			const result = findUnselectedItemsFiltered({
				limit: 10,
				filter: 0,
				latestId: 0,
			});
			expect(result).toEqual({ items: [], newLatestId: null });
		});
	});

	describe('filter === "-"', () => {
		it("returns all negative ids in ascending order", () => {
			const result = findUnselectedItemsFiltered({ limit: 20, filter: "-" });
			expect(ids(result.items)).toEqual([
				-2299, -2290, -229, -220, -22, -21, -5, -1,
			]);
		});

		it("paginates across a limit boundary", () => {
			const first = findUnselectedItemsFiltered({ limit: 3, filter: "-" });
			expect(ids(first.items)).toEqual([-2299, -2290, -229]);
			expect(first.newLatestId).toBe(-229);

			const second = findUnselectedItemsFiltered({
				limit: 10,
				filter: "-",
				latestId: -229,
			});
			expect(ids(second.items)).toEqual([-220, -22, -21, -5, -1]);
		});
	});

	describe("filter < 0", () => {
		it("matches ids across digit-length blocks in ascending order", () => {
			const result = findUnselectedItemsFiltered({ limit: 20, filter: -22 });
			expect(ids(result.items)).toEqual([-2299, -2290, -229, -220, -22]);
		});

		it("paginates across a digit-block boundary, fast-forwarding d correctly", () => {
			const first = findUnselectedItemsFiltered({ limit: 3, filter: -22 });
			expect(ids(first.items)).toEqual([-2299, -2290, -229]);
			expect(first.newLatestId).toBe(-229);

			const second = findUnselectedItemsFiltered({
				limit: 10,
				filter: -22,
				latestId: -229,
			});
			expect(ids(second.items)).toEqual([-220, -22]);
		});

		it("returns nothing when the filter is more negative than any unselected id", () => {
			const result = findUnselectedItemsFiltered({
				limit: 10,
				filter: -99999,
			});
			expect(result).toEqual({ items: [], newLatestId: null });
		});
	});

	describe("filter > 0", () => {
		it("matches ids across digit-length blocks in ascending order", () => {
			const result = findUnselectedItemsFiltered({ limit: 20, filter: 22 });
			expect(ids(result.items)).toEqual([22, 220, 221, 225, 229, 2200, 2205]);
		});

		it("paginates across a digit-block boundary, fast-forwarding d correctly", () => {
			const first = findUnselectedItemsFiltered({ limit: 2, filter: 22 });
			expect(ids(first.items)).toEqual([22, 220]);
			expect(first.newLatestId).toBe(220);

			const second = findUnselectedItemsFiltered({
				limit: 2,
				filter: 22,
				latestId: 220,
			});
			expect(ids(second.items)).toEqual([221, 225]);
		});

		it("returns nothing when the filter is bigger than any unselected id", () => {
			const result = findUnselectedItemsFiltered({
				limit: 10,
				filter: 999999,
			});
			expect(result).toEqual({ items: [], newLatestId: null });
		});

		it("excludes ids that are selected even if still present in unselectedIdsOrder", () => {
			selectedIdsUniqueValues.add(220); // simulates a stale/leftover entry
			const result = findUnselectedItemsFiltered({ limit: 20, filter: 22 });
			expect(ids(result.items)).toEqual([22, 221, 225, 229, 2200, 2205]);
		});
	});
});
