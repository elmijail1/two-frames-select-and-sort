import type React from "react";
import type { SetStateAction } from "react";

interface IErrorMessageProps {
	error: string;
	setError: React.Dispatch<SetStateAction<string | null>>;
}

export function ErrorMessage({ error, setError }: IErrorMessageProps) {
	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<p style={{ color: "red" }}>{error}</p>
			<button
				type="button"
				style={{
					background: "none",
					border: "1px solid red",
					borderRadius: "50%",
					rotate: "45deg",
					fontSize: "1.3rem",
					color: "red",
				}}
				onClick={() => setError(null)}
			>
				+
			</button>
		</div>
	);
}
