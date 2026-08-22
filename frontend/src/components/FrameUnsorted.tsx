import { useState } from "react";
import { ErrorMessage } from "./ErrorMessage";
import { Frame, type IFrameProps } from "./Frame";

interface IFrameUnsortedProps extends IFrameProps {
	addItem: (id: number) => void;
}

export function FrameUnsorted({
	items,
	onSelect,
	addItem,
}: IFrameUnsortedProps) {
	const [error, setError] = useState<string | null>(null);
	const [newItem, setNewItem] = useState<string>("");

	return (
		<Frame items={items} onSelect={onSelect}>
			{error && <ErrorMessage error={error} setError={setError} />}
			<form>
				<input
					type="text"
					placeholder="Enter ID of a new item"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
				/>
				<button
					onClick={() => {
						setError(null);
						if (newItem.length === 0) {
							setError("Enter at least one character");
							return;
						} else if (newItem.length > 0 && Number(newItem)) {
							try {
								addItem(Number(newItem));
							} catch (e) {
								const err = e as { message: string };
								setError(err.message);
							} finally {
								setNewItem("");
							}
						} else {
							setError("ID must be a number");
						}
					}}
					type="button"
					disabled={newItem.length === 0}
				>
					Add
				</button>
			</form>
		</Frame>
	);
}
