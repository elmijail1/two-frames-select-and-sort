import type React from "react";
import type { SetStateAction } from "react";

interface IFilterProps {
	filter: string;
	setFilter: React.Dispatch<SetStateAction<string>>;
}

export function Filter({ filter, setFilter }: IFilterProps) {
	return (
		<div className="relative max-w-22 flex items-center">
			<input
				className="sticky w-18 top-0 left-0 z-10 "
				type="text"
				placeholder="Filter by ID"
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
			/>
			{filter && (
				<button
					type="reset"
					onClick={() => setFilter("")}
					className="h-full bg-gray-200 hover:bg-gray-300 flex justify-center items-center text-gray-800 border border-gray-400 cursor-pointer"
				>
					⤫
				</button>
			)}
		</div>
	);
}
