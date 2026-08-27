import {
	useQueryClient,
	useInfiniteQuery,
	keepPreviousData,
} from "@tanstack/react-query";
import { Items } from "./Items";
import { Filter } from "./Filter";
import { useEffect, useRef, useState } from "react";
import { useSelectQueue } from "../hooks/useSelectQueue";
import { handleSelection } from "../handlers/handleSelection";
import type { IGetItemsResponse } from "../types/apiTypes";

export type TUnselectedQueryKey = readonly ["items", "unselected", string];

interface IGetItemsParams {
	pageParam?: number;
	queryKey: TUnselectedQueryKey;
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

	const { enqueue: enqueueSelect } = useSelectQueue("select");
	const queryClient = useQueryClient();

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
				position: "relative",
				zIndex: "1",
			}}
			ref={containerRef}
		>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<Filter filter={filter} setFilter={setFilter} />
				<div
					style={{
						display: "flex",
					}}
				>
					<input
						type="text"
						placeholder="New ID"
						style={{ maxWidth: "4rem" }}
					/>
					<button type="button">Add</button>
				</div>
			</div>
			<Items
				displayed={items}
				onSelect={(id) =>
					handleSelection({ id, queryClient, queryKey, enqueueSelect })
				}
			/>
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
