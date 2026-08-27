import { useRef } from "react";

type TSelectType = "select" | "unselect";

export function useSelectQueue(selectType: TSelectType) {
	const queueRef = useRef<Set<number>>(new Set());
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	function scheduleFlush() {
		if (timeoutRef.current !== null) return;
		timeoutRef.current = setTimeout(flush, 1000);
	}

	async function flush() {
		timeoutRef.current = null;
		const idsToFlush = Array.from(queueRef.current);
		if (idsToFlush.length === 0) return;

		for (const id of idsToFlush) {
			queueRef.current.delete(id);
		}

		const url =
			selectType === "select"
				? "/api/items/selected/batch"
				: "/api/items/unselected/batch";

		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(idsToFlush),
			});
			if (!res.ok) throw new Error("Failed to flush selection batch");
		} catch (error) {
			console.error(error);
		} finally {
			if (queueRef.current.size > 0) {
				scheduleFlush();
			}
		}
	}

	function enqueue(id: number) {
		queueRef.current.add(id);
		scheduleFlush();
	}

	return { enqueue };
}
