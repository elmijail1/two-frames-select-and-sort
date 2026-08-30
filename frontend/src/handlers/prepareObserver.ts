import type {
	FetchNextPageOptions,
	InfiniteData,
	InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import type React from "react";
import type { IGetItemsResponse } from "../types/apiTypes";

interface IPrepareObserverProps {
	containerRef: React.RefObject<HTMLElement | null>;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: (
		options?: FetchNextPageOptions | undefined,
	) => Promise<
		InfiniteQueryObserverResult<
			InfiniteData<IGetItemsResponse, number | undefined>,
			Error
		>
	>;
}

export function prepareObserver({
	containerRef,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}: IPrepareObserverProps) {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
		{ root: containerRef.current },
	);
	return observer;
}
