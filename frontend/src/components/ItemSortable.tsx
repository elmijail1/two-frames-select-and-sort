import { useSortable } from "@dnd-kit/react/sortable";
import { type IItemProps, Item } from "./Item";

interface IItemSortableProps extends IItemProps {
	index: number;
}

export function ItemSortable({
	id,
	index,
	onSelect,
	pending,
}: IItemSortableProps) {
	const { ref } = useSortable({ id, index });

	return (
		<Item
			id={id}
			onSelect={onSelect}
			ref={ref}
			pending={pending}
			sortable={true}
		/>
	);
}
