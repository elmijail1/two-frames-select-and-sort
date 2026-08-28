import {
	selectedIdsOrder,
	selectedIdsUniqueValues,
	unselectedIdsOrder,
	unselectedIdsUniqueValues,
} from "../data";
import type {
	TSelectItemsQueryParams,
	TUnselectItemsQueryParams,
} from "../schemas";
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
		unselectedIdsUniqueValues.delete(id);
		selectedIdsUniqueValues.add(id);
		selectedIdsOrder.push(id);
		added.push(id);
	}

	if (added.length === 1) {
		const id = added[0];
		const ind = findFirstIndexGreaterThan(unselectedIdsOrder, id) - 1;
		unselectedIdsOrder.splice(ind, 1);
	} else if (added.length > 1) {
		let writeIndex = 0;
		for (let i = 0; i < unselectedIdsOrder.length; i++) {
			const currentId = unselectedIdsOrder[i];
			if (!unselectedIdsUniqueValues.has(currentId)) continue;
			unselectedIdsOrder[writeIndex] = currentId;
			writeIndex++;
		}
		unselectedIdsOrder.length = writeIndex;
	}

	return { added, failed, totalIds: added.length + failed.length };
}

export function unselectItems(
	ids: TUnselectItemsQueryParams,
): TSelectItemsReturn {
	const added: number[] = [];
	const failed: number[] = [];
	for (const id of ids) {
		if (unselectedIdsUniqueValues.has(id)) {
			console.error("ID is already unselected: ", id);
			failed.push(id);
			continue;
		}
		if (!selectedIdsUniqueValues.has(id)) {
			console.error("ID isn't present in the selected array: ", id);
			failed.push(id);
			continue;
		}
		selectedIdsUniqueValues.delete(id);
		unselectedIdsUniqueValues.add(id);
		const oldInd = selectedIdsOrder.indexOf(id);
		selectedIdsOrder.splice(oldInd, 1);
		const newInd = findFirstIndexGreaterThan(unselectedIdsOrder, id);
		unselectedIdsOrder.splice(newInd, 0, id);

		added.push(id);
	}
	return { added, failed, totalIds: added.length + failed.length };
}
