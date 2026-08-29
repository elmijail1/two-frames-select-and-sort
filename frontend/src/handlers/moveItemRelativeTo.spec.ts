import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { IGetItemsResponse } from "../types/apiTypes";
import { moveItemRelativeTo } from "./moveItemRelativeTo";

function makeData(pages: IGetItemsResponse[]): InfiniteData<IGetItemsResponse> {
	return { pages, pageParams: pages.map(() => undefined) };
}

function ids(data: InfiniteData<IGetItemsResponse>) {
	return data.pages.map((page) => page.items.map((item) => item.id));
}

describe("moveItemRelativeTo", () => {
	it("reorders within a single page", () => {
		const data = makeData([
			{
				items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
				newLatestId: null,
			},
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 1,
			neighbourId: 3,
			side: "after",
		});
		expect(ids(result)).toEqual([[2, 3, 1, 4]]);
	});

	it("moves an item next to its immediately adjacent neighbour", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 2,
			neighbourId: 1,
			side: "before",
		});
		expect(ids(result)).toEqual([[2, 1, 3]]);
	});

	it("moves an item across a page boundary and keeps page sizes unchanged", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: 3 },
			{ items: [{ id: 4 }, { id: 5 }, { id: 6 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 1,
			neighbourId: 5,
			side: "after",
		});
		expect(ids(result)).toEqual([
			[2, 3, 4],
			[5, 1, 6],
		]);
		expect(result.pages[0].items.length).toBe(data.pages[0].items.length);
		expect(result.pages[1].items.length).toBe(data.pages[1].items.length);
	});

	it("moves an item across a page boundary with side: before", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: 3 },
			{ items: [{ id: 4 }, { id: 5 }, { id: 6 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 6,
			neighbourId: 2,
			side: "before",
		});
		expect(ids(result)).toEqual([
			[1, 6, 2],
			[3, 4, 5],
		]);
	});

	it("preserves page metadata (e.g. newLatestId) while replacing items", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }], newLatestId: 2 },
			{ items: [{ id: 3 }, { id: 4 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 1,
			neighbourId: 3,
			side: "after",
		});
		expect(result.pages[0].newLatestId).toBe(2);
		expect(result.pages[1].newLatestId).toBe(null);
	});

	it("returns the original data unchanged when the moved id isn't found", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 999,
			neighbourId: 1,
			side: "after",
		});
		expect(result).toBe(data);
	});

	it("returns the original data unchanged when the neighbour isn't found", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 1,
			neighbourId: 999,
			side: "after",
		});
		expect(result).toBe(data);
	});

	it("is a no-op when id and neighbourId are the same", () => {
		const data = makeData([
			{ items: [{ id: 1 }, { id: 2 }, { id: 3 }], newLatestId: null },
		]);
		const result = moveItemRelativeTo({
			oldData: data,
			id: 2,
			neighbourId: 2,
			side: "after",
		});
		expect(result).toBe(data);
		expect(ids(result)).toEqual([[1, 2, 3]]);
	});
});
