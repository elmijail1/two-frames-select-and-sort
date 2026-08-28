import {
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsUniqueValues,
} from "../data";
import type { TReorderItem, TSortItemsQueryParams } from "../schemas";
import type { TSortItemsReturn } from "../types";

export function sortItems(items: TSortItemsQueryParams): TSortItemsReturn {
	const reordered: TSortItemsQueryParams = [];
	const failed: TSortItemsQueryParams = [];
	for (const item of items) {
		try {
			reorderItem(item);
			reordered.push(item);
		} catch (error) {
			console.warn("Failed to reorder an item: ", item, "\n Error: ", error);
			failed.push(item);
		}
	}
	return { reordered, failed, totalItems: reordered.length + failed.length };
}

function reorderItem({ id, neighbourId, side }: TReorderItem) {
	if (!selectedIdsUniqueValues.has(id) || unselectedIdsUniqueValues.has(id)) {
		throw new Error("ID not found");
	}
	if (
		!selectedIdsUniqueValues.has(neighbourId) ||
		unselectedIdsUniqueValues.has(neighbourId)
	) {
		throw new Error("ID not found");
	}

	if (id === neighbourId) {
		throw new Error("Can't reorder an item relative to itself");
	}

	const fromIndex = selectedIdsOrder.indexOf(id);
	if (fromIndex === -1) throw new Error("ID not found");
	selectedIdsOrder.splice(fromIndex, 1);

	let targetIndex = selectedIdsOrder.indexOf(neighbourId);
	if (targetIndex === -1) {
		selectedIdsOrder.splice(fromIndex, 0, id);
		throw new Error("Neighbour's ID not found");
	}
	if (side === "after") targetIndex += 1;
	selectedIdsOrder.splice(targetIndex, 0, id);
}
