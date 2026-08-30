import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { TUnselectedQueryKey } from "../components/FrameUnselected";
import type { IGetItemsResponse } from "../types/apiTypes";
import { appendItemToEnd } from "./appendItemToEnd";

interface IHandleSelectionProps {
	id: number;
	enqueueSelect: (id: number) => void;
	queryKey: TUnselectedQueryKey;
	queryClient: QueryClient;
}

export function handleSelection({
	id,
	enqueueSelect,
	queryKey,
	queryClient,
}: IHandleSelectionProps) {
	enqueueSelect(id);

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
		if (filter && !String(id).startsWith(filter)) {
			continue;
		}
		queryClient.setQueryData(key, appendItemToEnd(oldData, id));
	}
}
