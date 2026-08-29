export interface IItemProps {
	id: number;
	onSelect?: (id: number) => void;
	ref?: (element: Element | null) => void;
	sortable?: boolean;
}

export function Item({ id, onSelect, ref, sortable }: IItemProps) {
	const standardColors =
		"bg-[hsl(150,100%,60%)] text-[hsl(150,100%,20%)] border-[hsl(150,50%,50%)]";
	const sortableColors =
		"bg-[hsl(25,100%,80%)] text-[hsl(25,100%,35%)] border-[25,50%,50%)]";
	return (
		<button
			ref={ref ? ref : undefined}
			type="button"
			className={`w-16 h-16 border-r-2  rounded-md flex justify-center items-center shrink-0 text-lg text-wrap wrap-anywhere leading-4 ${sortable ? sortableColors : standardColors}`}
			onClick={onSelect ? () => onSelect(id) : undefined}
		>
			{id}
		</button>
	);
}
