import createError from "http-errors";
import {
	itemsById,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type { TAddItemsQueryParams } from "../schemas";
import { findFirstIndexGreaterThan } from "./utilities";

function addItem(id: number) {
	if (
		itemsById.get(id) ||
		unselectedIdsUniqueValues.has(id) ||
		selectedIdsUniqueValues.has(id)
	) {
		throw createError(409, "Item already exists", { data: { id } });
	}
	itemsById.set(id, { id });
	if (id > unselectedIdsOrder[unselectedIdsOrder.length - 1]) {
		unselectedIdsOrder.push(id);
		unselectedIdsUniqueValues.add(id);
		return { id, index: unselectedIdsOrder.length - 1 };
	}
	const index = findFirstIndexGreaterThan(unselectedIdsOrder, id);
	unselectedIdsOrder.splice(index, 0, id);
	unselectedIdsUniqueValues.add(id);
	return { id, index };
}

export function addItems(ids: TAddItemsQueryParams) {
	const added: number[] = [];
	const failed: number[] = [];
	for (const id of ids) {
		try {
			addItem(id);
			added.push(id);
		} catch (error) {
			console.error(error);
			failed.push(id);
		}
	}
	return { added, failed, totalIds: added.length + failed.length };
}
