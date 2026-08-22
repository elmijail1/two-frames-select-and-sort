import type React from "react";
import type { SetStateAction } from "react";

interface IFilterProps {
	filter: string;
	setFilter: React.Dispatch<SetStateAction<string>>;
}

export function Filter({ filter, setFilter }: IFilterProps) {
	return (
		<div>
			<input
				type="text"
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
			/>
		</div>
	);
}
