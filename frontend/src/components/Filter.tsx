import type React from "react";
import type { SetStateAction } from "react";

interface IFilterProps {
	filter: string;
	setFilter: React.Dispatch<SetStateAction<string>>;
}

export function Filter({ filter, setFilter }: IFilterProps) {
	return (
		<input
			style={{
				maxWidth: "5rem",
				position: "sticky",
				top: 0,
				left: 0,
				zIndex: 1,
			}}
			type="text"
			placeholder="Filter by ID"
			value={filter}
			onChange={(e) => setFilter(e.target.value)}
		/>
	);
}
