import type { InfiniteData } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";

export function insertItemSorted(
	oldData: InfiniteData<IGetItemsResponse>,
	id: number,
): InfiniteData<IGetItemsResponse> {
	if (oldData.pages.length === 0) {
		return {
			...oldData,
			pages: [{ items: [{ id }], newLatestId: null }],
			pageParams: [undefined],
		};
	}
	let inserted = false;
	const lastIndex = oldData.pages.length - 1;
	return {
		...oldData,
		pages: oldData.pages.map((page, pageIndex) => {
			if (inserted) return page;
			const firstGreater = page.items.find((item) => item.id > id);
			if (!firstGreater && pageIndex === lastIndex) {
				return { ...page, items: [...page.items, { id }] };
			}
			if (!firstGreater) return page;
			const index = page.items.indexOf(firstGreater);
			inserted = true;
			return {
				...page,
				items: [
					...page.items.slice(0, index),
					{ id },
					...page.items.slice(index),
				],
			};
		}),
	};
}
