import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TSide } from "../types/genTypes";
import type { TSelectedQueryKey } from "../types/queryTypes";
import { moveItemRelativeTo } from "./moveItemRelativeTo";

interface IHandleReorderProps {
	id: number;
	neighbourId: number;
	side: TSide;
	enqueueReorder: (id: number, neighbourId: number, side: TSide) => void;
	queryKey: TSelectedQueryKey;
	queryClient: QueryClient;
}

export function handleReorder({
	id,
	neighbourId,
	side,
	enqueueReorder,
	queryKey,
	queryClient,
}: IHandleReorderProps) {
	enqueueReorder(id, neighbourId, side);
	queryClient.setQueryData(
		queryKey,
		(oldData: InfiniteData<IGetItemsResponse> | undefined) => {
			if (!oldData) return undefined;
			return moveItemRelativeTo({ oldData, id, neighbourId, side });
		},
	);
}
