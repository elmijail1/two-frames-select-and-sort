import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { pingActivity } from "../handlers/debouncedInvalidate";

export function useLiveUpdates(enabled: boolean) {
	const queryClient = useQueryClient();
	useEffect(() => {
		if (!enabled) return;
		let source: EventSource | null = null;

		function connect() {
			source = new EventSource("/api/events");
			source.addEventListener("unselected-changed", () =>
				pingActivity(queryClient),
			);
			source.addEventListener("selected-changed", () =>
				pingActivity(queryClient),
			);
		}

		function disconnect() {
			source?.close();
			source = null;
		}

		function handleVisibilityChange() {
			if (document.visibilityState === "hidden") {
				disconnect();
			} else {
				disconnect();
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
