import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
	ADD_INTERVAL_MS,
	SELECT_INTERVAL_MS,
} from "../configs/batchingIntervals";
import { ADD_URL, SELECT_URL, UNSELECT_URL } from "../configs/urls";
import { pingActivity } from "../handlers/debouncedInvalidate";

type TSelectType = "select" | "unselect";

function useBatchQueue(
	url: string,
	intervalMs: number,
	storageKey: string,
	onFailed?: (ids: number[]) => void,
) {
	const queueRef = useRef<Set<number>>(new Set());
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

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
		writeStoredQueue(storageKey, queueRef.current);

		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(idsToFlush),
			});
			if (!res.ok) throw new Error("Failed to flush a batch");
			const result: { added: number[]; failed: number[] } = await res.json();
			if (result.failed.length > 0) onFailed?.(result.failed);
		} catch (error) {
			console.error(error);
		} finally {
			setPendingIds((prev) => {
				const next = new Set(prev);
				for (const id of idsToFlush) {
					next.delete(id);
				}
				return next;
			});
			if (queueRef.current.size > 0) {
				scheduleFlush();
			}
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run it only once on mount, to rehydrate from the prev. session
	useEffect(() => {
		const stored = readStoredQueue(storageKey);
		if (stored.length === 0) return;
		for (const id of stored) queueRef.current.add(id);
		setPendingIds(new Set(queueRef.current));
		scheduleFlush();
	}, []);

	const queryClient = useQueryClient();
	function enqueue(id: number) {
		queueRef.current.add(id);
		writeStoredQueue(storageKey, queueRef.current);
		setPendingIds((prev) => new Set(prev).add(id));
		scheduleFlush();
		pingActivity(queryClient);
	}

	return { enqueue, pendingIds };
}

export function useSelectQueue(selectType: TSelectType) {
	const url = selectType === "select" ? SELECT_URL : UNSELECT_URL;
	return useBatchQueue(url, SELECT_INTERVAL_MS, `queue:${selectType}`);
}

export function useAddItemQueue(onFailed?: (ids: number[]) => void) {
	return useBatchQueue(ADD_URL, ADD_INTERVAL_MS, "queue:add", onFailed);
}

function readStoredQueue(storageKey: string): number[] {
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((n) => typeof n === "number")
			: [];
	} catch {
		return [];
	}
}

function writeStoredQueue(storageKey: string, ids: Set<number>) {
	try {
		localStorage.setItem(storageKey, JSON.stringify([...ids]));
	} catch {
		console.warn("Failed to write to local storage");
	}
}
