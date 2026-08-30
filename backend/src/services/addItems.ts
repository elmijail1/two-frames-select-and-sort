import createError from "http-errors";
import {
	itemsById,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type { TAddItemsQueryParams } from "../schemas";
import { findFirstIndexGreaterThan, mergeSortedInsert } from "./utilities";
import { markUnselectedDirty } from "./changeTracking";

export function addItems(ids: TAddItemsQueryParams) {
	const added: number[] = [];
	const failed: number[] = [];
	for (const id of ids) {
		try {
			validateAndRegisterItem(id);
			added.push(id);
		} catch (error) {
			console.error(error);
			failed.push(id);
		}
	}

	if (added.length > 3) {
		mergeSortedInsert(unselectedIdsOrder, added);
	} else {
		for (let i = 0; i < added.length; i++) {
			const id = added[i];
			const ind = findFirstIndexGreaterThan(unselectedIdsOrder, id);
			unselectedIdsOrder.splice(ind, 0, id);
		}
	}

	if (added.length > 0) markUnselectedDirty();
	return { added, failed, totalIds: added.length + failed.length };
}

function validateAndRegisterItem(id: number): void {
	if (
		itemsById.get(id) ||
		unselectedIdsUniqueValues.has(id) ||
		selectedIdsUniqueValues.has(id)
	) {
		throw createError(409, "Item already exists", { data: { id } });
	}
	itemsById.set(id, { id });
	unselectedIdsUniqueValues.add(id);
}
