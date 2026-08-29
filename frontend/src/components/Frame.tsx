import type React from "react";
import type { ReactNode } from "react";

interface IFrameProps {
	containerRef: React.RefObject<HTMLElement | null>;
	sortable?: boolean;
	children?: ReactNode;
}

export function Frame({ containerRef, sortable, children }: IFrameProps) {
	const standardColors = "bg-[hsl(150,100%,90%)]";
	const sortableColors = "bg-[hsl(25,100%,95%)]";
	("bg-[hsl(25,100%,80%)] text-[hsl(25,100%,35%)] border-[25,50%,50%)]");
	return (
		<section
			className={`w-[40%] h-40 overflow-y-auto overflow-x-hidden rounded-xl flex flex-col gap-4 relative z-10 p-4 ${sortable ? sortableColors : standardColors}`}
			ref={containerRef}
		>
			{children}
		</section>
	);
}
