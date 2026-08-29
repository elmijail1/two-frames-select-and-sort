import { DragDropProvider } from "@dnd-kit/react";
import {
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { handleReorder } from "../handlers/handleReorder";
import { handleUnselection } from "../handlers/handleUnselection";
import { useSelectQueue } from "../hooks/useBatchQueue";
import { useReorderQueue } from "../hooks/useReorderQueue";
import type { IGetItemsResponse } from "../types/apiTypes";
import { Filter } from "./Filter";
import { Frame } from "./Frame";
import { Items } from "./Items";

export type TSelectedQueryKey = readonly ["items", "selected", string];

interface IGetItemsParams {
	pageParam?: number;
	queryKey: TSelectedQueryKey;
}

interface SortableDraggable {
	sortable: { index: number };
}

// TODOC: TS goes bananas about source.sortable.index w/o it: it doesn't see "sortable" on "source", since it's added on it at runtime by OptimisticSortingPlugin – console.log() it to make sure that the real object has this shape, hence it's safe to type-guard it this way
function hasSortableIndex(x: unknown): x is SortableDraggable {
	return typeof x === "object" && x !== null && "sortable" in x;
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

export function FrameSelected() {
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
	const items = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data],
	);

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

	const { enqueueReorder } = useReorderQueue();

	if (isLoading) return <p>Loading...</p>;
	if (isError) return <p>Failed to load items</p>;

	return (
		<DragDropProvider
			onDragEnd={(e) => {
				if (e.canceled) return;
				const { source } = e.operation;
				if (!source || !hasSortableIndex(source)) return;

				const id = Number(source.id);
				if (Number.isNaN(id)) return;
				const newIndex = source.sortable.index;

				const itemsWithoutDraggedItem = items.filter((i) => i.id !== id);
				const reconstructed = [
					...itemsWithoutDraggedItem.slice(0, newIndex),
					{ id },
					...itemsWithoutDraggedItem.slice(newIndex),
				];
				const position = reconstructed.findIndex((i) => i.id === id);
				const prev = reconstructed[position - 1];
				const next = reconstructed[position + 1];

				if (prev) {
					handleReorder({
						id,
						neighbourId: prev.id,
						side: "after",
						enqueueReorder,
						queryKey,
						queryClient,
					});
				} else if (next) {
					handleReorder({
						id,
						neighbourId: next.id,
						side: "before",
						enqueueReorder,
						queryKey,
						queryClient,
					});
				}
			}}
		>
			<Frame containerRef={containerRef} sortable={true}>
				<Filter filter={filter} setFilter={setFilter} />
				<Items
					displayed={items}
					onSelect={(id) =>
						handleUnselection({ id, enqueueUnselect, queryKey, queryClient })
					}
					sorted={true}
					containerRef={containerRef}
				/>
				<div
					ref={sentinelRef}
					style={{
						height: "1rem",
						flexShrink: 0,
					}}
				></div>
			</Frame>
		</DragDropProvider>
	);
}
