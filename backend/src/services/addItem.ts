import createError from "http-errors";
import {
	itemsById,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type { TAddItemQueryParams } from "../schemas";
import { findFirstIndexGreaterThan } from "./utilities";

export function addItem({ id }: TAddItemQueryParams) {
	if (
		itemsById.get(id) ||
		unselectedIdsUniqueValues.has(id) ||
		selectedIdsUniqueValues.has(id)
	) {
		throw createError(409, { message: `Item already exists`, data: { id } });
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
