import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useState } from "react";
import type { IItem } from "../types/genTypes";
import { Item } from "./Item";
import { ItemSortable } from "./ItemSortable";

interface IItemsProps {
	displayed: IItem[];
	onSelect: (id: number) => void;
	sorted?: boolean;
	containerRef: React.RefObject<HTMLElement | null>;
}

const ITEM_SIZE_PX = 32;
const HORIZONTAL_PADDING_PX = 16;

export function Items({
	displayed,
	onSelect,
	sorted,
	containerRef,
}: IItemsProps) {
	const [itemsPerRow, setItemsPerRow] = useState(1);
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function updateItemsPerRow() {
			const current = containerRef.current;
			if (!current) return;
			const availableWIdth = current.clientWidth - HORIZONTAL_PADDING_PX * 2;
			setItemsPerRow(Math.max(1, Math.floor(availableWIdth / ITEM_SIZE_PX)));
		}

		updateItemsPerRow();
		const observer = new ResizeObserver(updateItemsPerRow);
		observer.observe(container);
		return () => observer.disconnect();
	}, [containerRef]);

	const rows = useMemo(() => {
		const result: IItem[][] = [];
		for (let i = 0; i < displayed.length; i += itemsPerRow) {
			result.push(displayed.slice(i, i + itemsPerRow));
		}
		return result;
	}, [displayed, itemsPerRow]);

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => ITEM_SIZE_PX,
		overscan: 5,
	});

	if (sorted) {
		return (
			<div style={{ display: "flex", flexWrap: "wrap", margin: "0 1rem" }}>
				{displayed.map((i, ind) => (
					<ItemSortable key={i.id} id={i.id} index={ind} onSelect={onSelect} />
				))}
			</div>
		);
	}

	return (
		<div
			style={{
				height: rowVirtualizer.getTotalSize(),
				width: "100%",
				position: "relative",
				flexShrink: 0,
			}}
		>
			{rowVirtualizer.getVirtualItems().map((virtualRow) => (
				<div
					key={virtualRow.key}
					style={{
						position: "absolute",
						top: 0,
						left: "1rem",
						right: "1rem",
						height: virtualRow.size,
						transform: `translateY(${virtualRow.start}px)`,
						display: "flex",
					}}
				>
					{rows[virtualRow.index].map((item) => (
						<Item key={item.id} id={item.id} onSelect={onSelect} />
					))}
				</div>
			))}
		</div>
	);
}
