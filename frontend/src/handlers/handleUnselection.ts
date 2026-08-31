import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TSelectedQueryKey } from "../types/queryTypes";
import { insertItemSorted } from "./insertItemSorted";

interface IHandleUnselectionProps {
	id: number;
	enqueueUnselect: (id: number) => void;
	queryKey: TSelectedQueryKey;
	queryClient: QueryClient;
}

export function handleUnselection({
	id,
	enqueueUnselect,
	queryKey,
	queryClient,
}: IHandleUnselectionProps) {
	enqueueUnselect(id);

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
		if (filter && !String(id).startsWith(filter)) {
			continue;
		}
		queryClient.setQueryData(key, insertItemSorted(oldData, id));
	}
}
