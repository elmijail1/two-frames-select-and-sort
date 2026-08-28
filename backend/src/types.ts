import type { TGetItemsQueryParams, TReorderItem } from "./schemas";

export interface IItem {
	id: number;
}

export type TFindItemsParams = Omit<TGetItemsQueryParams, "filter">;
export type TFindItemsFilteredParams = Omit<TGetItemsQueryParams, "filter"> & {
	filter: NonNullable<TGetItemsQueryParams["filter"]>;
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

export type TSortItemsReturn = {
	totalItems: number;
	reordered: TReorderItem[];
	failed: TReorderItem[];
};
