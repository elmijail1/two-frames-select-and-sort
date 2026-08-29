import type React from "react";
import type { SetStateAction } from "react";

interface IFilterProps {
	filter: string;
	setFilter: React.Dispatch<SetStateAction<string>>;
}

export function Filter({ filter, setFilter }: IFilterProps) {
	return (
		<div className="relative max-w-20">
			<input
				className="sticky max-w-20 top-0 left-0 z-10 "
				type="text"
				placeholder="Filter by ID"
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
			/>
			{filter && (
				<button
					type="reset"
					onClick={() => setFilter("")}
					className="w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-4xl flex justify-center items-center text-gray-500 absolute top-1 -right-1 z-10 border border-gray-300 cursor-pointer"
				>
					⤫
				</button>
			)}
		</div>
	);
}
