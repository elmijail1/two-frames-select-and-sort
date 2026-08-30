import type { IItem } from "./genTypes";

export interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}
