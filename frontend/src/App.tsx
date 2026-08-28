import { useState } from "react";
import "./App.css";
import { FrameSelectedProper } from "./components/FrameSelectedProper";
import { FrameSorted } from "./components/FrameSorted";
import { FrameUnselectedProper } from "./components/FrameUnselectedProper";
import { FrameUnsorted } from "./components/FrameUnsorted";
import type { TSide } from "./types/genTypes";

export interface IItem {
	id: number;
}

const itemsInit = [
	{ id: 1 },
	{ id: 2 },
	{ id: 3 },
	{ id: 4 },
	{ id: 5 },
	{ id: 11 },
	{ id: 12 },
	{ id: 110 },
];

function App() {
	const [items, setItems] = useState<IItem[]>([...itemsInit]);
	const [unselected, setUnselected] = useState<IItem[]>([...items]);
	const [selected, setSelected] = useState<IItem[]>([]);

	function selectItem(id: number) {
		setUnselected((prev) => prev.filter((i) => i.id !== id));
		setSelected(
			(prev) => [...prev, items.find((i) => i.id === id) || { id: 0 }], // no strict automated sorting since manual is allowed
		);
	}
	function unselectItem(id: number) {
		setSelected((prev) => prev.filter((i) => i.id !== id));
		setUnselected((prev) =>
			[...prev, items.find((i) => i.id === id) || { id: 0 }].sort(
				(a, b) => a.id - b.id,
			),
		);
	}
	function reorderSelected(id: number, neighbourId: number, side: TSide) {
		setSelected((prev) => {
			const fromIndex = prev.findIndex((i) => i.id === id);
			if (fromIndex === -1) return prev;
			const next = [...prev];
			const [moved] = next.splice(fromIndex, 1);
			let targetIndex = next.findIndex((i) => i.id === neighbourId);
			if (targetIndex === -1) return prev;
			if (side === "after") {
				targetIndex += 1;
			}
			next.splice(targetIndex, 0, moved);
			return next;
		});
	}
	function addItem(id: number) {
		if (items.find((i) => i.id === id)) {
			throw new Error("Duplicate IDs aren't allowed");
		}
		setItems((prev) => [...prev, { id }]);
		setUnselected((prev) => [...prev, { id }].sort((a, b) => a.id - b.id));
	}

	return (
		<main>
			<div
				style={{
					display: "flex",
					width: "90%",
					justifyContent: "center",
					gap: "1rem",
					backgroundColor: "hsl(50, 100%, 80%)",
					margin: "0 auto",
				}}
			>
				<FrameUnsorted
					items={unselected}
					onSelect={selectItem}
					addItem={addItem}
				/>
				<FrameSorted
					items={selected}
					onSelect={unselectItem}
					onReorder={reorderSelected}
				/>
			</div>

			<div
				style={{
					display: "flex",
					width: "90%",
					justifyContent: "center",
					gap: "1rem",
					backgroundColor: "hsl(150, 100%, 80%)",
					margin: "0 auto",
				}}
			>
				<FrameUnselectedProper />
				<FrameSelectedProper />
			</div>
		</main>
	);
}

export default App;
