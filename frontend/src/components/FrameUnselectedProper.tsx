import {
	type Query,
	type InfiniteData,
	useQueryClient,
	useInfiniteQuery,
	keepPreviousData,
} from "@tanstack/react-query";
import type { IItem } from "../App";
import { Items } from "./Items";
import { Filter } from "./Filter";
import { useEffect, useRef, useState } from "react";

type TUnselectedQueryKey = readonly ["items", "unselected", string];

interface IGetItemsParams {
	pageParam?: number;
	queryKey: TUnselectedQueryKey;
}

interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}

async function fetchUnselectedItems({
	pageParam,
	queryKey,
}: IGetItemsParams): Promise<IGetItemsResponse> {
	const filter = queryKey[2];
	const params = new URLSearchParams();
	if (pageParam !== undefined) {
		params.set("latestId", String(pageParam));
	}
	if (filter) params.set("filter", filter);
	const res = await fetch(`/api/items/unselected?${params}`);
	if (!res.ok) throw new Error("Failed to fetch unselected items");
	return res.json();
}

export function FrameUnselectedProper() {
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLElement | null>(null);
	const selectedRef = useRef<Set<number>>(new Set());
	const [filter, setFilter] = useState<string>("");
	const [debouncedFilter, setDebouncedFilter] = useState<string>("");

	useEffect(() => {
		const id = setTimeout(() => setDebouncedFilter(filter), 500);
		return () => clearTimeout(id);
	}, [filter]);

	const queryKey: TUnselectedQueryKey = [
		"items",
		"unselected",
		debouncedFilter,
	];
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
		queryFn: fetchUnselectedItems,
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

	const queryClient = useQueryClient();
	function handleSelection(id: number) {
		selectedRef.current.add(id);

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

		queryClient.setQueriesData(
			{ queryKey: ["items", "selected"], type: "active" },
			(oldData: InfiniteData<IGetItemsResponse> | undefined, query: Query) => {
				if (!oldData) return undefined;
				const filter = query?.queryKey[2] as string | undefined;
				if (filter && !String(id).startsWith(filter)) {
					return oldData;
				}
				if (oldData.pages.length === 0) {
					return {
						...oldData,
						pages: [{ items: [{ id }], newLatestId: null }],
						pageParams: [undefined],
					};
				}
				const lastIndex = oldData.pages.length - 1;
				return {
					...oldData,
					pages: oldData.pages.map((page, i) =>
						i === lastIndex
							? { ...page, items: [...page.items, { id }] }
							: page,
					),
				};
			},
		);
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
			<Items displayed={items} onSelect={handleSelection} />
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
