import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { TUnselectedQueryKey } from "../components/FrameUnselectedProper";
import type { IGetItemsResponse } from "../types/apiTypes";
import { insertItemSorted } from "./insertItemSorted";

interface IHandleAdditionProps {
	id: number;
	enqueueAddItem: (id: number) => void;
	queryKey: TUnselectedQueryKey;
	queryClient: QueryClient;
}

export function handleAddition({
	id,
	enqueueAddItem,
	queryKey,
	queryClient,
}: IHandleAdditionProps) {
	enqueueAddItem(id);
	const filter = queryKey[2];
	if (filter && !String(id).startsWith(filter)) return;

	const selectedMatches = queryClient.getQueriesData<
		InfiniteData<IGetItemsResponse>
	>({
		queryKey: ["items", "selected"],
		type: "active",
	});
	if (selectedMatches.some(([_key, data]) => itemExistsInCache(data, id)))
		return;

	queryClient.setQueryData(
		queryKey,
		(oldData: InfiniteData<IGetItemsResponse> | undefined) => {
			if (!oldData) return undefined;
			if (itemExistsInCache(oldData, id)) return oldData;
			return insertItemSorted(oldData, id);
		},
	);
}

function itemExistsInCache(
	data: InfiniteData<IGetItemsResponse> | undefined,
	id: number,
): boolean {
	if (!data) return false;
	return data.pages.some((page) => page.items.some((item) => item.id === id));
}
