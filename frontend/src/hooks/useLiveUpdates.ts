import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useLiveUpdates(enabled: boolean) {
	const queryClient = useQueryClient();
	useEffect(() => {
		if (!enabled) return;
		const source = new EventSource("/api/events");
		source.addEventListener("unselected-changed", () => {
			queryClient.invalidateQueries({ queryKey: ["items", "unselected"] });
		});
		source.addEventListener("selected-changed", () => {
			queryClient.invalidateQueries({ queryKey: ["items", "selected"] });
		});
		return () => source.close();
	}, [enabled, queryClient]);
}
