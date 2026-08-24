import type { TGetItemsQueryParams } from "./schemas";

export interface IItem {
	id: number;
}

export type TFindItemsParams = Omit<
	TGetItemsQueryParams,
	"selected" | "filter"
>;
export type TFindItemsFilteredParams = Omit<
	TGetItemsQueryParams,
	"selected"
> & {
	filter: number;
};

export type TFindItemsReturn = {
	items: IItem[];
	newLatestId: number | null;
};
