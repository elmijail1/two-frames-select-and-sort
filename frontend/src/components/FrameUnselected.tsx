import {
	type InfiniteData,
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchItems } from "../handlers/fetchItems";
import { handleAddition, itemExistsInCache } from "../handlers/handleAddition";
import { handleSelection } from "../handlers/handleSelection";
import { insertItemSorted } from "../handlers/insertItemSorted";
import { prepareObserver } from "../handlers/prepareObserver";
import { useAddItemQueue } from "../hooks/useBatchQueue";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { ISpecificFrameProps } from "../types/genTypes";
import type { TUnselectedQueryKey } from "../types/queryTypes";
import { Filter } from "./Filter";
import { Frame } from "./Frame";
import { Items } from "./Items";

export function FrameUnselected({
	enqueueSelection,
	pendingSelectedIds,
}: ISpecificFrameProps) {
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLElement | null>(null);
	const [filter, setFilter] = useState<string>("");
	const [debouncedFilter, setDebouncedFilter] = useState<string>("");
	const [itemToAdd, setItemToAdd] = useState<string>("");
	const [errorItemToAdd, setErrorItemToAdd] = useState<string>("");
	const [overlayIds, setOverlayIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		const id = setTimeout(() => setDebouncedFilter(filter), 500);
		return () => clearTimeout(id);
	}, [filter]);

	const queryKey: TUnselectedQueryKey = useMemo(
		() => ["items", "unselected", debouncedFilter],
		[debouncedFilter],
	);

	const initialPageParam: number | undefined = undefined;
	const { enqueue: enqueueAddItem, pendingIds: pendingAddedIds } =
		useAddItemQueue((failedIds) => {
			setOverlayIds((prev) => {
				if (failedIds.every((id) => !prev.has(id))) return prev;
				const next = new Set(prev);
				for (const id of failedIds) next.delete(id);
				return next;
			});
		});
	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<
		IGetItemsResponse,
		Error,
		InfiniteData<IGetItemsResponse, number | undefined>,
		TUnselectedQueryKey,
		number | undefined
	>({
		queryKey,
		queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
			fetchItems({
				pageParam,
				queryKey,
				itemType: "unselected",
			}),
		initialPageParam,
		getNextPageParam: (lastPage) => lastPage.newLatestId ?? undefined,
		placeholderData: keepPreviousData,
		select: (data) => {
			let result = data;
			for (const id of overlayIds) {
				if (debouncedFilter && !String(id).startsWith(debouncedFilter)) {
					continue;
				}
				if (itemExistsInCache(result, id)) continue;
				result = insertItemSorted(result, id);
			}
			return result;
		},
	});
	const items = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data],
	);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = prepareObserver({
			containerRef,
			hasNextPage,
			isFetchingNextPage,
			fetchNextPage,
		});
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const queryClient = useQueryClient();

	function addItem(id: string) {
		if (id.trim().length === 0 || Number.isNaN(Number(id))) {
			setErrorItemToAdd("Please enter a valid number");
			setItemToAdd("");
			return;
		}
		const numId = Number(id);
		const wasEnqueued = handleAddition({
			id: numId,
			enqueueAddItem,
			queryClient,
			queryKey,
		});
		if (!wasEnqueued) {
			setErrorItemToAdd("this item already exists");
			setItemToAdd("");
			return;
		}
		setOverlayIds((prev) => new Set(prev).add(numId));
		setItemToAdd("");
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: data isn't read directly; it's kept only to re-trigger this effect when the cache changes, since we intentionally read the raw pre-select cache below instead of data itself
	useEffect(() => {
		if (overlayIds.size === 0) return;
		const raw =
			queryClient.getQueryData<InfiniteData<IGetItemsResponse>>(queryKey);
		if (!raw) return;
		setOverlayIds((prev) => {
			let changed = false;
			const next = new Set(prev);
			for (const id of prev) {
				if (itemExistsInCache(raw, id)) {
					next.delete(id);
					changed = true;
				}
			}
			return changed ? next : prev;
		});
	}, [data, queryClient, queryKey, overlayIds]);

	if (isLoading) return <p>Loading...</p>;
	if (isError) return <p>Failed to load items</p>;

	return (
		<Frame containerRef={containerRef}>
			<div
				style={{
					position: "sticky",
					top: 0,
					zIndex: 1,
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<Filter filter={filter} setFilter={setFilter} />
				<div style={{ display: "flex" }}>
					<input
						type="text"
						placeholder="New ID"
						style={{ maxWidth: "4rem" }}
						value={itemToAdd}
						onChange={(e) => setItemToAdd(e.target.value)}
					/>
					<button
						type="button"
						onClick={() => addItem(itemToAdd)}
						className="cursor-pointer"
					>
						Add
					</button>
				</div>
			</div>

			<Items
				displayed={items}
				containerRef={containerRef}
				onSelect={(id) =>
					handleSelection({ id, queryClient, queryKey, enqueueSelection })
				}
				isPending={(id) =>
					pendingAddedIds.has(id) || pendingSelectedIds.has(id)
				}
			/>
			<div
				ref={sentinelRef}
				style={{
					height: "1rem",
					flexShrink: 0,
				}}
			></div>
			{errorItemToAdd && (
				<div
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 2,
					}}
				>
					<div
						style={{
							backgroundColor: "hsl(0, 900%, 80%)",
							borderRadius: "0.7rem",
							padding: "0.5rem",
						}}
					>
						<p>{errorItemToAdd}</p>
						<button
							type="button"
							onClick={() => setErrorItemToAdd("")}
							className="cursor-pointer"
						>
							OK
						</button>
					</div>
				</div>
			)}
		</Frame>
	);
}
