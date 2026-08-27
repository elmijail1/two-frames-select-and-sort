import {
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import type { IItem } from "../App";
import { Items } from "./Items";
import { Filter } from "./Filter";
import { useEffect, useRef, useState } from "react";
import { useSelectQueue } from "../hooks/useSelectQueue";

type TSelectedQueryKey = readonly ["items", "selected", string];

interface IGetItemsParams {
	pageParam?: number;
	queryKey: TSelectedQueryKey;
}

interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}

async function fetchSelectedItems({
	pageParam,
	queryKey,
}: IGetItemsParams): Promise<IGetItemsResponse> {
	const filter = queryKey[2];
	const params = new URLSearchParams();
	if (pageParam !== undefined) {
		params.set("latestId", String(pageParam));
	}
	if (filter) params.set("filter", filter);
	const res = await fetch(`/api/items/selected?${params}`);
	if (!res.ok) throw new Error("Failed to fetch selected items");
	return res.json();
}

export function FrameSelectedProper() {
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLElement | null>(null);
	const [filter, setFilter] = useState<string>("");
	const [debouncedFilter, setDebouncedFilter] = useState<string>("");

	useEffect(() => {
		const id = setTimeout(() => setDebouncedFilter(filter), 500);
		return () => clearTimeout(id);
	}, [filter]);

	const queryKey: TSelectedQueryKey = ["items", "selected", debouncedFilter];
	const initialPageParam: number | undefined = undefined;
	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey,
		queryFn: fetchSelectedItems,
		initialPageParam,
		getNextPageParam: (lastPage) => lastPage.newLatestId ?? undefined,
		placeholderData: keepPreviousData,
	});
	const items = data?.pages.flatMap((page) => page.items) ?? [];

	useEffect(() => {
		const sentinel = sentinelRef.current;
		const container = containerRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ root: container },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const { enqueue: enqueueUnselect } = useSelectQueue("unselect");
	const queryClient = useQueryClient();
	function handleUnselection(id: number) {
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

		const matches = queryClient.getQueriesData<InfiniteData<IGetItemsResponse>>(
			{
				queryKey: ["items", "unselected"],
				type: "active",
			},
		);

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
			return {
				...oldData,
				pages: oldData.pages.map((page, i) =>
					i === lastIndex ? { ...page, items: [...page.items, { id }] } : page,
				),
			};
		}
	}

	if (isLoading) return <p>Loading...</p>;
	if (isError) return <p>Failed to load items</p>;

	return (
		<section
			style={{
				width: "40%",
				height: "6rem",
				overflowY: "auto",
				border: "3px black solid",
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
			}}
			ref={containerRef}
		>
			<Filter filter={filter} setFilter={setFilter} />
			<Items displayed={items} onSelect={handleUnselection} />
			<div
				ref={sentinelRef}
				style={{
					height: "1rem",
					flexShrink: 0,
				}}
			></div>
		</section>
	);
}
