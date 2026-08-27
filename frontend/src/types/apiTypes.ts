import type { IItem } from "../App";

export interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}
