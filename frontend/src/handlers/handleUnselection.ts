import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TSelectionAction } from "../types/genTypes";
import type { TSelectedQueryKey } from "../types/queryTypes";
import { itemExistsInCache } from "./handleAddition";
import { insertItemSorted } from "./insertItemSorted";

interface IHandleUnselectionProps {
	id: number;
	enqueueSelection: (id: number, action: TSelectionAction) => void;
	queryKey: TSelectedQueryKey;
	queryClient: QueryClient;
}

export function handleUnselection({
	id,
	enqueueSelection,
	queryKey,
	queryClient,
}: IHandleUnselectionProps) {
	enqueueSelection(id, "unselect");

	queryClient.setQueryData(
		queryKey,
		(oldData: InfiniteData<IGetItemsResponse> | undefined) => {
			if (!oldData) return undefined;
			return {
				...oldData,
				pages: oldData.pages.map((page) => {
					const hasItem = page?.items.some((item) => item.id === id);
					return hasItem
						? { ...page, items: page?.items.filter((item) => item.id !== id) }
						: page;
				}),
			};
		},
	);

	const matches = queryClient.getQueriesData<InfiniteData<IGetItemsResponse>>({
		queryKey: ["items", "unselected"],
		type: "active",
	});

	for (const [key, oldData] of matches) {
		if (!oldData) continue;
		const filter = key[2] as string | undefined;
		if (filter && !String(id).startsWith(filter)) continue;
		if (itemExistsInCache(oldData, id)) {
			console.warn("Duplication attempt on unselection: ", id);
			continue;
		}
		queryClient.setQueryData(key, insertItemSorted(oldData, id));
	}
}
