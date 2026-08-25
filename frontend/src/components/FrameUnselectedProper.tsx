import { useQuery } from "@tanstack/react-query";
import type { IItem } from "../App";
import { Frame } from "./Frame";

interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}

async function fetchUnselectedItems(): Promise<IGetItemsResponse> {
	const res = await fetch("/api/items/unselected");
	if (!res.ok) throw new Error("Failed to fetch unselected items");
	return res.json();
}

export function FrameUnselectedProper() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["items", "unselected"],
		queryFn: fetchUnselectedItems,
	});
	const items = data?.items ?? [];

	if (isLoading) return <p>Loading...</p>;
	if (isError) return <p>Failed to load items</p>;

	return (
		<Frame items={items} onSelect={(id) => console.log(id)}>
			{/* new item addition interface */}
		</Frame>
	);
}
