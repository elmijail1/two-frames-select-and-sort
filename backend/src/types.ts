import type { TGetItemsQueryParams } from "./schemas";

export interface IItem {
	id: number;
}

export type TFindItemsParams = Omit<TGetItemsQueryParams, "filter">;
export type TFindItemsFilteredParams = TGetItemsQueryParams & {
	filter: number;
};

export type TFindItemsReturn = {
	items: IItem[];
	newLatestId: number | null;
};

export type TSelectItemsReturn = {
	totalIds: number;
	added: number[];
	failed: number[];
};
