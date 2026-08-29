import type React from "react";
import type { ReactNode } from "react";

interface IFrameProps {
	containerRef: React.RefObject<HTMLElement | null>;
	children?: ReactNode;
}

export function Frame({ containerRef, children }: IFrameProps) {
	return (
		<section
			className="w-[40%] h-40 bg-[hsl(150,100%,90%)] overflow-y-auto overflow-x-hidden rounded-xl flex flex-col gap-4 relative z-10 p-4"
			ref={containerRef}
		>
			{children}
		</section>
	);
}
