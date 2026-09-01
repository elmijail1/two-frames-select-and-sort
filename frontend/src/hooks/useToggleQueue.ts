import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { SELECT_INTERVAL_MS } from "../configs/batchingIntervals";
import { SELECT_URL, UNSELECT_URL } from "../configs/urls";
import { pingActivity } from "../handlers/debouncedInvalidate";
import type { TToggleAction } from "../types/genTypes";

export function useToggleQueue() {
	const queueRef = useRef<Map<number, TToggleAction>>(new Map());
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [pendingIds, setPendingIds] = useState<Map<number, TToggleAction>>(
		new Map(),
	);
	const queryClient = useQueryClient();

	function scheduleFlush() {
		if (timeoutRef.current !== null) return;
		timeoutRef.current = setTimeout(flush, SELECT_INTERVAL_MS);
	}

	async function flush() {
		timeoutRef.current = null;
		const entries = Array.from(queueRef.current.entries());
		if (entries.length === 0) return;
		for (const [id] of entries) queueRef.current.delete(id);

		const toSelect = entries
			.filter(([_a, b]) => b === "select")
			.map(([id]) => id);
		const toUnselect = entries
			.filter(([_a, b]) => b === "unselect")
			.map(([id]) => id);

		const requests: Promise<Response>[] = [];
		if (toSelect.length > 0) {
			requests.push(
				fetch(SELECT_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(toSelect),
				}),
			);
		}
		if (toUnselect.length > 0) {
			requests.push(
				fetch(UNSELECT_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(toUnselect),
				}),
			);
		}

		try {
			await Promise.all(requests);
		} catch (error) {
			console.error(error);
		} finally {
			setPendingIds((prev) => {
				const next = new Map(prev);
				for (const [id] of entries) next.delete(id);
				return next;
			});
			if (queueRef.current.size > 0) scheduleFlush();
			pingActivity(queryClient);
		}
	}

	function enqueue(id: number, action: TToggleAction) {
		queueRef.current.set(id, action);
		setPendingIds((prev) => new Map(prev).set(id, action));
		scheduleFlush();
		pingActivity(queryClient);
	}

	return { enqueue, pendingIds };
}
