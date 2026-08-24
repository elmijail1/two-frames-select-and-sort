import {
	itemsById,
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type {
	IItem,
	TFindItemsFilteredParams,
	TFindItemsParams,
	TFindItemsReturn,
} from "../types";
import { findFirstIndexGreaterThan } from "./utilities";

// TODO: WIP
export function findSelectedItems({
	latestId,
	filter,
	limit,
}: TFindItemsFilteredParams): TFindItemsReturn {
	// TOFIX: lazy temporary TS pacifier
	if (!latestId) return { items: [], newLatestId: null };
	// 👇 add a number limitation for filteredIds?
	const filteredIds = filter
		? selectedIdsOrder.filter((id) => String(id).startsWith(filter))
		: selectedIdsOrder;
	// 👇 we must make sure items aren't undefined
	const page = filteredIds
		.slice(latestId, latestId + limit)
		.map((id) => itemsById.get(id));
	const nextCursor =
		latestId + page.length < filteredIds.length ? latestId + page.length : null;
	return { items: page, newLatestId: nextCursor };
}

export function findUnselectedItems({
	latestId,
	limit,
}: TFindItemsParams): TFindItemsReturn {
	const items: IItem[] = [];
	let nextIndex = findFirstIndexGreaterThan(
		unselectedIdsOrder,
		latestId ?? -Infinity,
	);

	while (items.length < limit) {
		if (nextIndex >= unselectedIdsOrder.length) break;

		const id = unselectedIdsOrder[nextIndex];
		if (selectedIdsUniqueValues.has(id) || !unselectedIdsUniqueValues.has(id)) {
			nextIndex++;
			continue;
		}

		const item = itemsById.get(id);
		if (!item) {
			nextIndex++;
			continue;
		}

		items.push(item);
		nextIndex++;
	}
	const newLatestId = items.length ? items[items.length - 1].id : null;
	return { items, newLatestId };
}

export function findUnselectedItemsFiltered({
	latestId,
	limit,
	filter,
}: TFindItemsFilteredParams): TFindItemsReturn {
	const items: IItem[] = [];
	if (filter === 0) {
		return handleZeroFilter(latestId);
	}

	const biggestIdUnselected = unselectedIdsOrder[unselectedIdsOrder.length - 1];
	if (filter > biggestIdUnselected) {
		return { items: [], newLatestId: null };
	}
	let d = 0;
	if (latestId !== undefined) {
		while (filter * 10 ** d + 10 ** d - 1 < latestId) {
			d++;
		}
	}
	let id = 0;
	while (items.length < limit && id < biggestIdUnselected) {
		const blockSize = 10 ** d;
		const blockStart = filter * blockSize;
		if (blockStart > biggestIdUnselected) {
			return {
				items,
				newLatestId: items.length ? items[items.length - 1].id : null,
			};
		}
		const blockEnd = blockStart + blockSize - 1;

		for (id = blockStart; id <= blockEnd && items.length < limit; id++) {
			if (latestId !== undefined && id <= latestId) continue;
			if (!unselectedIdsUniqueValues.has(id) || selectedIdsUniqueValues.has(id))
				continue;

			const newItem = itemsById.get(id);
			if (!newItem) continue;
			items.push(newItem);
		}
		d++;
	}
	const newLatestId = items.length ? items[items.length - 1].id : null;
	return { items, newLatestId };
}

function handleZeroFilter(latestId?: number) {
	const alreadyDelivered = 0 <= (latestId ?? -Infinity);
	if (
		!alreadyDelivered &&
		unselectedIdsUniqueValues.has(0) &&
		!selectedIdsUniqueValues.has(0)
	) {
		const zeroItem = itemsById.get(0);
		if (zeroItem) {
			return { items: [zeroItem], newLatestId: 0 };
		}
	}
	return { items: [], newLatestId: null };
}
