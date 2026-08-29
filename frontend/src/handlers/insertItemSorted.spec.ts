import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { IGetItemsResponse } from "../types/apiTypes";
import { insertItemSorted } from "./insertItemSorted";

function makeData(pages: IGetItemsResponse[]): InfiniteData<IGetItemsResponse> {
	return { pages, pageParams: pages.map(() => undefined) };
}

function ids(data: InfiniteData<IGetItemsResponse>) {
	return data.pages.map((page) => page.items.map((item) => item.id));
}

describe("insertItemSorted", () => {
	it("bootstraps a single page when there are no pages yet", () => {
		const result = insertItemSorted(makeData([]), 5);
		expect(ids(result)).toEqual([[5]]);
		expect(result.pages[0].newLatestId).toBe(null);
	});

	it("inserts into the middle of a single loaded page", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 3 }, { id: 5 }], newLatestId: null },
		]);
		const result = insertItemSorted(data, 4);
		expect(ids(result)).toEqual([[1, 3, 4, 5]]);
	});

	it("inserts at the start of a page", () => {
		const data = makeData([
			{ items: [{ id: 3 }, { id: 5 }], newLatestId: null },
		]);
		const result = insertItemSorted(data, 1);
		expect(ids(result)).toEqual([[1, 3, 5]]);
	});

	it("inserts into the correct page when the item belongs before a later page's contents", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }], newLatestId: 2 },
			{ items: [{ id: 5 }, { id: 6 }], newLatestId: null },
		]);
		const result = insertItemSorted(data, 4);
		expect(ids(result)).toEqual([
			[1, 2],
			[4, 5, 6],
		]);
	});

	it("only inserts once, even though later pages could also match", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 10 }], newLatestId: 10 },
			{ items: [{ id: 20 }, { id: 30 }], newLatestId: null },
		]);
		const result = insertItemSorted(data, 5);
		expect(ids(result)).toEqual([
			[1, 5, 10],
			[20, 30],
		]);
	});

	it("appends to the end of the last page when everything has been loaded", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }], newLatestId: null },
		]);
		const result = insertItemSorted(data, 99);
		expect(ids(result)).toEqual([[1, 2, 99]]);
	});

	it("does not insert when more unloaded data may exist beyond the last page", () => {
		const data = makeData([{ items: [{ id: 1 }, { id: 2 }], newLatestId: 2 }]);
		const result = insertItemSorted(data, 220);
		expect(ids(result)).toEqual([[1, 2]]);
	});

	it("does not insert across multiple pages when the last page still has more data to load", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }], newLatestId: 2 },
			{ items: [{ id: 10 }, { id: 20 }], newLatestId: 20 },
		]);
		const result = insertItemSorted(data, 220);
		expect(ids(result)).toEqual([
			[1, 2],
			[10, 20],
		]);
	});
});
