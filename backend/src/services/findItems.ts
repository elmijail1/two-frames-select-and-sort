import {
	itemsById,
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type { TGetItemsQueryParams } from "../schemas";
import type {
	IItem,
	TFindItemsFilteredParams,
	TFindItemsParams,
	TFindItemsReturn,
} from "../types";
import { findFirstIndexGreaterThan } from "./utilities";

export function findSelectedItems({
	latestId,
	filter,
	limit,
}: TGetItemsQueryParams): TFindItemsReturn {
	const items: IItem[] = [];
	let nextIndex =
		latestId !== undefined ? selectedIdsOrder.indexOf(latestId) + 1 : 0;

	while (items.length < limit && nextIndex < selectedIdsOrder.length) {
		const id = selectedIdsOrder[nextIndex];
		if (unselectedIdsUniqueValues.has(id) || !selectedIdsUniqueValues.has(id)) {
			nextIndex++;
			continue;
		}

		if (filter !== undefined && !String(id).startsWith(String(filter))) {
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
	if (filter === "-") {
		return handleBareMinusFilter(limit, latestId);
	}
	if (filter < 0) {
		return handleNegativeFilter(filter, limit, latestId);
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

function handleBareMinusFilter(limit: number, latestId?: number) {
	const items: IItem[] = [];
	const firstNonNegativeIndex = findFirstIndexGreaterThan(
		unselectedIdsOrder,
		-1,
	);
	let nextIndex = findFirstIndexGreaterThan(
		unselectedIdsOrder,
		latestId ?? -Infinity,
	);

	while (items.length < limit && nextIndex < firstNonNegativeIndex) {
		const id = unselectedIdsOrder[nextIndex];
		if (!unselectedIdsUniqueValues.has(id) || selectedIdsUniqueValues.has(id)) {
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

function handleNegativeFilter(
	filter: number,
	limit: number,
	latestId?: number,
) {
	const items: IItem[] = [];
	const lowestIdUnselected = unselectedIdsOrder[0];
	if (filter < lowestIdUnselected) {
		return { items: [], newLatestId: null };
	}

	let maxD = 0;
	while (filter * 10 ** (maxD + 1) >= lowestIdUnselected) {
		maxD++;
	}

	let d = maxD;
	if (latestId !== undefined) {
		while (d > 0 && filter * 10 ** d <= latestId) {
			d--;
		}
	}

	let id = 0;
	while (items.length < limit && d >= 0) {
		const blockSize = 10 ** d;
		const blockEnd = filter * blockSize;
		const blockStart = blockEnd - blockSize + 1;

		for (id = blockStart; id <= blockEnd && items.length < limit; id++) {
			if (latestId !== undefined && id <= latestId) continue;
			if (
				!unselectedIdsUniqueValues.has(id) ||
				selectedIdsUniqueValues.has(id)
			) {
				continue;
			}
			const newItem = itemsById.get(id);
			if (!newItem) continue;
			items.push(newItem);
		}
		d--;
	}
	const newLatestId = items.length ? items[items.length - 1].id : null;
	return { items, newLatestId };
}
