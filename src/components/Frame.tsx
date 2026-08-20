import { useEffect, useState } from "react";
import type { IItem } from "../App";
import { Item } from "./Item";

interface IFrameProps {
	name: "selected" | "unselected";
	items: IItem[];
	onSelect: (id: number) => void;
	addItem?: (id: number) => void;
}

export function Frame({ name, items, onSelect, addItem }: IFrameProps) {
	const [filter, setFilter] = useState<string>("");
	const [displayed, setDisplayed] = useState<IItem[]>([]);
	const [newItem, setNewItem] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setDisplayed([...items]);
	}, [items]);

	useEffect(() => {
		// TODO: add a debouncer
		if (filter.trim().length > 0) {
			setDisplayed(items.filter((i) => String(i.id).startsWith(filter)));
		} else {
			setDisplayed([...items]);
		}
	}, [filter, items]);
	return (
		<section
			style={{
				width: "40%",
				height: "10rem",
				border: "3px black solid",
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
			}}
		>
			<div>
				<input
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
			</div>
			<div style={{ display: "flex", flexWrap: "wrap", margin: "0 1rem" }}>
				{displayed.map((i) => (
					<Item key={i.id} id={i.id} onSelect={onSelect} />
				))}
			</div>
			{error && (
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
			)}
			{name === "unselected" && addItem && (
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
			)}
		</section>
	);
}
