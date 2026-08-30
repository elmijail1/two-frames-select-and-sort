import type { InfiniteData } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";

export function appendItemToEnd<TPageParam = number | undefined>(
	oldData: InfiniteData<IGetItemsResponse, TPageParam>,
	id: number,
): InfiniteData<IGetItemsResponse, TPageParam> {
	if (oldData.pages.length === 0) {
		return {
			...oldData,
			pages: [{ items: [{ id }], newLatestId: null }],
			pageParams: [undefined as TPageParam],
		};
	}

	const lastIndex = oldData.pages.length - 1;
	if (oldData.pages[lastIndex].newLatestId !== null) return oldData;

	return {
		...oldData,
		pages: oldData.pages.map((page, i) =>
			i === lastIndex ? { ...page, items: [...page.items, { id }] } : page,
		),
	};
}
