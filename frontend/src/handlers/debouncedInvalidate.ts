import type { QueryClient } from "@tanstack/react-query";

const DEBOUNCE_MS = 1500;

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function pingActivity(queryClient: QueryClient) {
	if (timeoutId !== null) clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		timeoutId = null;
		queryClient.invalidateQueries({ queryKey: ["items"] });
	}, DEBOUNCE_MS);
}
