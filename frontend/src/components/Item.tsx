export interface IItemProps {
	id: number;
	onSelect?: (id: number) => void;
	ref?: (element: Element | null) => void;
	sortable?: boolean;
	pending?: boolean;
}

export function Item({ id, onSelect, ref, sortable, pending }: IItemProps) {
	const standardColors =
		"bg-[hsl(150,100%,60%)] hover:bg-[hsl(150,90%,50%)] text-[hsl(150,100%,20%)] border-[hsl(150,50%,50%)] hover:border-[hsl(150,80%,30%)]";
	const sortableColors =
		"bg-[hsl(25,100%,80%)] hover:bg-[hsl(25,90%,70%)] text-[hsl(25,100%,35%)] border-[25,50%,50%)] hover:border-[hsl(25,80%,30%)]";
	const disabledStyles =
		"disabled:cursor-auto disabled:bg-[hsl(0,0%,60%)] disabled:hover:bg-[hsl(0,0%,50%)] disabled:text-[hsl(0,0%,20%)] disabled:border-[hsl(0,0%,50%)] disabled:hover:border-[hsl(0,0%,30%)]";

	return (
		<button
			ref={ref ? ref : undefined}
			type="button"
			className={`w-16 h-16 border-r-2 rounded-md flex justify-center items-center shrink-0 text-lg text-wrap wrap-anywhere leading-4 cursor-pointer ${sortable ? sortableColors : standardColors} ${disabledStyles}`}
			onClick={onSelect ? () => onSelect(id) : undefined}
			disabled={pending}
		>
			{id}
		</button>
	);
}
