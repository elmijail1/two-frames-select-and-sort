import type React from "react";
import type { SetStateAction } from "react";

interface IFilterProps {
	filter: string;
	setFilter: React.Dispatch<SetStateAction<string>>;
}

export function Filter({ filter, setFilter }: IFilterProps) {
	return (
		<input
			style={{ maxWidth: "5rem" }}
			type="text"
			placeholder="Filter by ID"
			value={filter}
			onChange={(e) => setFilter(e.target.value)}
		/>
	);
}
