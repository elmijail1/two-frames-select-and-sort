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

	queryClient.setQueryData(
		queryKey,
		(oldData: InfiniteData<IGetItemsResponse> | undefined) => {
			if (!oldData) return undefined;
			return insertItemSorted(oldData, id);
		},
	);
}
