import { useRef } from "react";

export function useSelectQueue() {
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

		try {
			const res = await fetch("/api/items/selected/batch", {
				method: "POST",
				headers: { "Content-Type": "application/json " },
				body: JSON.stringify(idsToFlush),
			});
			if (!res.ok) throw new Error("Failed to flush selection batch");
			// TODO: reconcile added / failed from the res against the optimistic cache
		} catch (error) {
			console.error(error);
		} finally {
			if (queueRef.current.size > 0) {
				scheduleFlush();
			}
		}
	}

	function enqueueSelect(id: number) {
		queueRef.current.add(id);
		scheduleFlush();
	}

	return { enqueueSelect };
}
