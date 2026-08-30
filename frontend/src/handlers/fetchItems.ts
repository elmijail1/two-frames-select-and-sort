import { FETCH_SELECTED_URL, FETCH_UNSELECTED_URL } from "../configs/urls";
import type { IGetItemsResponse } from "../types/apiTypes";
import type { TItemType } from "../types/genTypes";
import type {
	TSelectedQueryKey,
	TUnselectedQueryKey,
} from "../types/queryTypes";

interface IGetItemsParams {
	pageParam?: number;
	queryKey: TSelectedQueryKey | TUnselectedQueryKey;
	itemType: TItemType;
}

export async function fetchItems({
	pageParam,
	queryKey,
	itemType,
}: IGetItemsParams): Promise<IGetItemsResponse> {
	const filter = queryKey[2];
	if (filter && filter !== "-" && Number.isNaN(Number(filter))) {
		return { items: [], newLatestId: null };
	}
	const params = new URLSearchParams();
	if (pageParam !== undefined) {
		params.set("latestId", String(pageParam));
	}
	if (filter) params.set("filter", filter);
	const url =
		itemType === "selected" ? FETCH_SELECTED_URL : FETCH_UNSELECTED_URL;
	const res = await fetch(`${url}?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch ${itemType} items`);
	return res.json();
}
