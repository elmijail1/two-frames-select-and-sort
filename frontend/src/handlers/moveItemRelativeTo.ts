import type { InfiniteData } from "@tanstack/react-query";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TSide } from "../types/genTypes";

interface IMoveItemRelativeTo {
	oldData: InfiniteData<IGetItemsResponse>;
	id: number;
	neighbourId: number;
	side: TSide;
}

export function moveItemRelativeTo({
	oldData,
	id,
	neighbourId,
	side,
}: IMoveItemRelativeTo): InfiniteData<IGetItemsResponse> {
	const allItems = oldData.pages.flatMap((page) => page.items);
	const moved = allItems.find((item) => item.id === id);
	if (!moved) return oldData;

	const withoutMoved = allItems.filter((item) => item.id !== id);
	const neighbourIndex = withoutMoved.findIndex(
		(item) => item.id === neighbourId,
	);
	if (neighbourIndex === -1) return oldData;

	const insertAt = side === "after" ? neighbourIndex + 1 : neighbourIndex;
	const reordered = [
		...withoutMoved.slice(0, insertAt),
		moved,
		...withoutMoved.slice(insertAt),
	];

	// page.items size normalization
	let cursor = 0;
	const pages = oldData.pages.map((page) => {
		const pageItems = reordered.slice(cursor, cursor + page.items.length);
		cursor += page.items.length;
		return { ...page, items: pageItems };
	});

	return { ...oldData, pages };
}
