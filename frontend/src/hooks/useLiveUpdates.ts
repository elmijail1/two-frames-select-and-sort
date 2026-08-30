import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useLiveUpdates(enabled: boolean) {
	const queryClient = useQueryClient();
	useEffect(() => {
		if (!enabled) return;
		let source: EventSource | null = null;

		function connect() {
			source = new EventSource("/api/events");
			source.addEventListener("unselected-changed", () => {
				queryClient.invalidateQueries({ queryKey: ["items", "unselected"] });
			});
			source.addEventListener("selected-changed", () => {
				queryClient.invalidateQueries({ queryKey: ["items", "selected"] });
			});
		}

		function disconnect() {
			source?.close();
			source = null;
		}

		function handleVisibilityChange() {
			if (document.visibilityState === "hidden") {
				disconnect();
			} else {
				connect();
				queryClient.invalidateQueries({ queryKey: ["items"] });
			}
		}

		if (document.visibilityState === "visible") connect();
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			disconnect();
		};
	}, [enabled, queryClient]);
}
