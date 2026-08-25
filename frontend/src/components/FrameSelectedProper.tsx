import type { IItem } from "../App";
import { Frame } from "./Frame";
import { useQuery } from "@tanstack/react-query";

interface IGetItemsResponse {
	items: IItem[];
	newLatestId: number | null;
}

async function fetchSelectedItems(): Promise<IGetItemsResponse> {
	const res = await fetch("/api/items/selected");
	if (!res.ok) throw new Error("Failed to fetch selected items");
	return res.json();
}

export function FrameSelectedProper() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["items", "selected"],
		queryFn: fetchSelectedItems,
	});
	const items = data?.items ?? [];

	if (isLoading) return <p>Loading...</p>;
	if (isError) return <p>Failed to load items</p>;

	return (
		<Frame items={items} onSelect={(id) => console.log(id)}>
			{/* drag and drop stuff */}
		</Frame>
	);
}
