import {
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type { TSelectItemsQueryParams } from "../schemas";
import type { TSelectItemsReturn } from "../types";
import { findFirstIndexGreaterThan } from "./utilities";

export function selectItems(ids: TSelectItemsQueryParams): TSelectItemsReturn {
	const added: number[] = [];
	const failed: number[] = [];
	for (const id of ids) {
		if (selectedIdsUniqueValues.has(id)) {
			console.error("ID is already selected: ", id);
			failed.push(id);
			continue;
		}
		if (!unselectedIdsUniqueValues.has(id)) {
			console.error("ID isn't present in the unselected array: ", id);
			failed.push(id);
			continue;
		}
		selectedIdsUniqueValues.add(id);
		selectedIdsOrder.push(id);
		unselectedIdsUniqueValues.delete(id);
		const ind = findFirstIndexGreaterThan(unselectedIdsOrder, id) - 1;
		unselectedIdsOrder.splice(ind, 1);
		added.push(id);
	}
	return { added, failed, totalIds: added.length + failed.length };
}
