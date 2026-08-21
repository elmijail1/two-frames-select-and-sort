import { DragDropProvider } from "@dnd-kit/react";
import { Frame, type IFrameProps } from "./Frame";

interface IFrameSortedProps extends IFrameProps {
	onReorder: (fromId: number, toId: number) => void;
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
	return (
		<DragDropProvider
			onDragEnd={(e) => {
				if (e.canceled) return;
				const { source } = e.operation;
				if (!source || !hasSortableIndex(source)) return; // todo: add error handler

				const id = Number(source.id);
				if (Number.isNaN(id)) return; // todo: add error handler

				onReorder(id, source.sortable.index);
			}}
		>
			<Frame items={selected} onSelect={unselectItem} sorted={true} />
		</DragDropProvider>
	);
}
