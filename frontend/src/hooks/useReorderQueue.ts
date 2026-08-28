import { useRef } from "react";
import { REORDER_INTERVAL_MS } from "../configs/batchingIntervals";
import { REORDER_URL } from "../configs/urls";
import type { TSide } from "../types/genTypes";

type TReorderEntry = { neighbourId: number; side: TSide };

export function useReorderQueue() {
	const queueRef = useRef<Map<number, TReorderEntry>>(new Map());
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	function scheduleFlush() {
		if (timeoutRef.current !== null) return;
		timeoutRef.current = setTimeout(flush, REORDER_INTERVAL_MS);
	}

	async function flush() {
		timeoutRef.current = null;
		const entries = Array.from(queueRef.current.entries()).map(
			([id, { neighbourId, side }]) => ({ id, neighbourId, side }),
		);
		if (entries.length === 0) return;

		for (const { id } of entries) queueRef.current.delete(id);

		try {
			const res = await fetch(REORDER_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(entries),
			});
			if (!res.ok) throw new Error("Failed to flush a reorder batch");
		} catch (error) {
			console.error(error);
		} finally {
			if (queueRef.current.size > 0) scheduleFlush;
		}
	}

	function enqueueReorder(id: number, neighbourId: number, side: TSide) {
		queueRef.current.set(id, { neighbourId, side });
		scheduleFlush();
	}

	return { enqueueReorder };
}
