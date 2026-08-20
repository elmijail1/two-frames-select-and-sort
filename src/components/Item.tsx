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
			style={{
				width: "2rem",
				height: "2rem",
				borderRadius: "50%",
				backgroundColor: "hsl(100, 80%, 80%)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
			onClick={onSelect ? () => onSelect(id) : undefined}
		>
			{id}
		</button>
	);
}
