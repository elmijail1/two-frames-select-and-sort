export interface IItemProps {
	id: number;
	onSelect?: (id: number) => void;
	ref?: (element: Element | null) => void;
}

export function Item({ id, onSelect, ref }: IItemProps) {
	return (
		<button
			ref={ref ? ref : undefined}
			type="button"
			className="w-16 h-16 border-r-2 border-[hsl(150,50%,50%)] rounded-md flex justify-center items-center shrink-0 bg-[hsl(150,100%,60%)] text-[hsl(150,100%,20%)] text-lg text-wrap wrap-anywhere leading-4"
			onClick={onSelect ? () => onSelect(id) : undefined}
		>
			{id}
		</button>
	);
}
