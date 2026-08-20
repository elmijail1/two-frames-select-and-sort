import type { IItem } from "../App";
import { Item } from "./Item";

interface IItemsProps {
	displayed: IItem[];
	onSelect: (id: number) => void;
}

export function Items({ displayed, onSelect }: IItemsProps) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", margin: "0 1rem" }}>
			{displayed.map((i) => (
				<Item key={i.id} id={i.id} onSelect={onSelect} />
			))}
		</div>
	);
}
