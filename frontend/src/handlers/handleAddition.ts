import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { TUnselectedQueryKey } from "../components/FrameUnselected";
import type { IGetItemsResponse } from "../types/apiTypes";

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
	const unselectedData =
		queryClient.getQueryData<InfiniteData<IGetItemsResponse>>(queryKey);
	if (itemExistsInCache(unselectedData, id)) return false;

	const selectedMatches = queryClient.getQueriesData<
		InfiniteData<IGetItemsResponse>
	>({ queryKey: ["items", "selected"], type: "active" });
	if (selectedMatches.some(([, data]) => itemExistsInCache(data, id))) {
		return false;
	}

	enqueueAddItem(id);
	return true;
}

export function itemExistsInCache(
	data: InfiniteData<IGetItemsResponse> | undefined,
	id: number,
): boolean {
	if (!data) return false;
	return data.pages.some((page) => page.items.some((item) => item.id === id));
}
