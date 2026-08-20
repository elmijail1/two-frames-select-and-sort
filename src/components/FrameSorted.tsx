import { DragDropProvider } from "@dnd-kit/react";
import { Frame, type IFrameProps } from "./Frame";

interface IFrameSortedProps extends IFrameProps {
	onReorder: (fromId: number, toId: number) => void;
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
				const { source, target } = e.operation;
				if (!source || !target) return; // todo: add error handler
				const fromId = Number(source.id);
				const toId = Number(target.id);
				if (Number.isNaN(fromId) || Number.isNaN(toId)) return; // todo: add error handler
				onReorder(fromId, toId);
			}}
		>
			<Frame items={selected} onSelect={unselectItem} sorted={true} />
		</DragDropProvider>
	);
}
