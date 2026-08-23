import { DragDropProvider } from "@dnd-kit/react";
import { Frame, type IFrameProps } from "./Frame";
import { useRef } from "react";
import type { IItem } from "../App";

interface IFrameSortedProps extends IFrameProps {
	onReorder: (id: number, neighborId: number, side: "before" | "after") => void;
}
interface SortableDraggable {
	sortable: { index: number };
}

// TODOC: TS goes bananas about source.sortable.index w/o it: it doesn't see "sortable" on "source", since it's added on it at runtime by OptimisticSortingPlugin – console.log() it to make sure that the real object has this shape, hence it's safe to type-guard it this way
function hasSortableIndex(x: unknown): x is SortableDraggable {
	return typeof x === "object" && x !== null && "sortable" in x;
}

export function FrameSorted({
	items: selected,
	onSelect: unselectItem,
	onReorder,
}: IFrameSortedProps) {
	const displayedRef = useRef<IItem[]>([]);
	return (
		<DragDropProvider
			onDragEnd={(e) => {
				if (e.canceled) return;
				const { source } = e.operation;
				if (!source || !hasSortableIndex(source)) return; // todo: add error handler

				const id = Number(source.id);
				if (Number.isNaN(id)) return; // todo: add error handler
				const newIndex = source.sortable.index;

				const itemsWithoutDraggedItem = displayedRef.current.filter(
					(i) => i.id !== id,
				);
				const reconstructed = [
					...itemsWithoutDraggedItem.slice(0, newIndex),
					{ id },
					...itemsWithoutDraggedItem.slice(newIndex),
				];
				const position = reconstructed.findIndex((i) => i.id === id);
				const prev = reconstructed[position - 1];
				const next = reconstructed[position + 1];

				if (prev) {
					onReorder(id, prev.id, "after");
				} else if (next) {
					onReorder(id, next.id, "before");
				}
			}}
		>
			<Frame
				items={selected}
				onSelect={unselectItem}
				sorted={true}
				onDisplayedChange={(displayed) => {
					displayedRef.current = displayed;
				}}
			/>
		</DragDropProvider>
	);
}
