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
import { markSelectedDirty, markUnselectedDirty } from "./changeTracking";
import { findFirstIndexGreaterThan, mergeSortedInsert } from "./utilities";

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

	if (added.length > 0) {
		markUnselectedDirty();
		markSelectedDirty();
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
		added.push(id);
	}

	if (added.length > 0) {
		let writeIndex = 0;
		for (let i = 0; i < selectedIdsOrder.length; i++) {
			const currentId = selectedIdsOrder[i];
			if (!selectedIdsUniqueValues.has(currentId)) continue;
			selectedIdsOrder[writeIndex] = currentId;
			writeIndex++;
		}
		selectedIdsOrder.length = writeIndex;

		if (added.length > 3) {
			mergeSortedInsert(unselectedIdsOrder, added);
		} else {
			for (let i = 0; i < added.length; i++) {
				const id = added[i];
				const ind = findFirstIndexGreaterThan(unselectedIdsOrder, id);
				unselectedIdsOrder.splice(ind, 0, id);
			}
		}
	}

	if (added.length > 0) {
		markUnselectedDirty();
		markSelectedDirty();
	}
	return { added, failed, totalIds: added.length + failed.length };
}
