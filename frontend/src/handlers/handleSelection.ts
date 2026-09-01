import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TSelectionAction } from "../types/genTypes";
import type { TUnselectedQueryKey } from "../types/queryTypes";
import { appendItemToEnd } from "./appendItemToEnd";
import { itemExistsInCache } from "./handleAddition";

interface IHandleSelectionProps {
	id: number;
	enqueueSelection: (id: number, action: TSelectionAction) => void;
	queryKey: TUnselectedQueryKey;
	queryClient: QueryClient;
}

export function handleSelection({
	id,
	enqueueSelection,
	queryKey,
	queryClient,
}: IHandleSelectionProps) {
	enqueueSelection(id, "select");

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
		queryKey: ["items", "selected"],
		type: "active",
	});

	for (const [key, oldData] of matches) {
		if (!oldData) continue;
		const filter = key[2] as string | undefined;
		if (filter && !String(id).startsWith(filter)) continue;
		if (itemExistsInCache(oldData, id)) {
			console.warn("Duplication attempt on selection: ", id);
			continue;
		}
		queryClient.setQueryData(key, appendItemToEnd(oldData, id));
	}
}
