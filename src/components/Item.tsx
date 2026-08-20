interface IItemProps {
	id: number;
	onSelect?: (id: number) => void;
}

export function Item({ id, onSelect }: IItemProps) {
	return (
		<button
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
