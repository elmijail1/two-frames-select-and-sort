import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { TSelectedQueryKey } from "../components/FrameSelectedProper";
import type { IGetItemsResponse } from "../types/apiTypes";

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
		if (oldData.pages.length === 0) {
			queryClient.setQueryData(key, {
				...oldData,
				pages: [{ items: [{ id }], newLatestId: null }],
				pageParams: [undefined],
			});
			continue;
		}
		let inserted = false;
		const lastIndex = oldData.pages.length - 1;
		queryClient.setQueryData(key, {
			...oldData,
			pages: oldData.pages.map((page, pageIndex) => {
				if (inserted) return page;
				const firstGreater = page.items.find((item) => item.id > id);
				if (!firstGreater && pageIndex === lastIndex) {
					return {
						...page,
						items: [...page.items, { id }],
					};
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
		});
	}
}
