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
	pendingIds?: Set<number>;
}

const ITEM_SIZE_PX_SMALL = 64;
const ITEM_SIZE_PX_BIG = 72;
const HORIZONTAL_PADDING_PX = 16;
const GAP_PX = 8;

export function Items({
	displayed,
	onSelect,
	sorted,
	containerRef,
	pendingIds,
}: IItemsProps) {
	const [itemsPerRow, setItemsPerRow] = useState(1);
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function updateItemsPerRow() {
			const current = containerRef.current;
			if (!current) return;
			const isSmall = window.matchMedia("(max-width: 1024px)").matches;
			const itemSize = isSmall ? ITEM_SIZE_PX_SMALL : ITEM_SIZE_PX_BIG;
			const availableWIdth = current.clientWidth - HORIZONTAL_PADDING_PX * 2;
			setItemsPerRow(
				Math.max(
					1,
					Math.floor((availableWIdth + GAP_PX) / (itemSize + GAP_PX)),
				),
			);
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
		estimateSize: () => {
			const isSmall = window.matchMedia("(max-width: 1024px)").matches;
			const itemSize = isSmall ? ITEM_SIZE_PX_SMALL : ITEM_SIZE_PX_BIG;
			return itemSize + GAP_PX;
		},
		overscan: 5,
	});

	if (sorted) {
		return (
			<div className="flex flex-wrap my-0 gap-2">
				{displayed.map((i, ind) => (
					<ItemSortable key={i.id} id={i.id} index={ind} onSelect={onSelect} />
				))}
			</div>
		);
	}

	return (
		<div
			className="shrink-0 relative w-full"
			style={{
				height: rowVirtualizer.getTotalSize(),
			}}
		>
			{rowVirtualizer.getVirtualItems().map((virtualRow) => (
				<div
					key={virtualRow.key}
					className="absolute top-0 gap-2 flex"
					style={{
						height: virtualRow.size,
						transform: `translateY(${virtualRow.start}px)`,
					}}
				>
					{rows[virtualRow.index].map((item) => (
						<Item
							key={item.id}
							id={item.id}
							onSelect={onSelect}
							pending={pendingIds?.has(item.id)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
