import type React from "react";
import type { ReactNode } from "react";

interface IFrameProps {
	containerRef: React.RefObject<HTMLElement | null>;
	children?: ReactNode;
}

export function Frame({ containerRef, children }: IFrameProps) {
	return (
		<section
			style={{
				width: "40%",
				height: "6rem",
				overflowY: "auto",
				border: "3px black solid",
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				position: "relative",
				zIndex: "1",
			}}
			ref={containerRef}
		>
			{children}
		</section>
	);
}
