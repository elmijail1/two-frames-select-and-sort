import type { IItem } from "../App";
import { Item } from "./Item";
import { ItemSortable } from "./ItemSortable";

interface IItemsProps {
	displayed: IItem[];
	onSelect: (id: number) => void;
	sorted?: boolean;
}

export function Items({ displayed, onSelect, sorted }: IItemsProps) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", margin: "0 1rem" }}>
			{displayed.map((i, ind) =>
				sorted ? (
					<ItemSortable key={i.id} id={i.id} index={ind} onSelect={onSelect} />
				) : (
					<Item key={i.id} id={i.id} onSelect={onSelect} />
				),
			)}
		</div>
	);
}
