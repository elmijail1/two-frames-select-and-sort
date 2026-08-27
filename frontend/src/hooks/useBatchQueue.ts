import { useRef } from "react";
import {
	ADD_INTERVAL_MS,
	SELECT_INTERVAL_MS,
} from "../configs/batchingIntervals";
import { ADD_URL, SELECT_URL, UNSELECT_URL } from "../configs/urls";

type TSelectType = "select" | "unselect";

function useBatchQueue(url: string, intervalMs: number) {
	const queueRef = useRef<Set<number>>(new Set());
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	function scheduleFlush() {
		if (timeoutRef.current !== null) return;
		timeoutRef.current = setTimeout(flush, intervalMs);
	}

	async function flush() {
		timeoutRef.current = null;
		const idsToFlush = Array.from(queueRef.current);
		if (idsToFlush.length === 0) return;

		for (const id of idsToFlush) {
			queueRef.current.delete(id);
		}

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

export function useSelectQueue(selectType: TSelectType) {
	const url = selectType === "select" ? SELECT_URL : UNSELECT_URL;
	return useBatchQueue(url, SELECT_INTERVAL_MS);
}

export function useAddItemQueue() {
	return useBatchQueue(ADD_URL, ADD_INTERVAL_MS);
}
