import { useEffect, useState } from "react";
import type { IItem } from "../App";
import { Items } from "./Items";
import { Filter } from "./Filter";

export interface IFrameProps {
	items: IItem[];
	onSelect: (id: number) => void;
	children?: React.ReactNode;
}

export function Frame({ items, onSelect, children }: IFrameProps) {
	const [filter, setFilter] = useState<string>("");
	const [displayed, setDisplayed] = useState<IItem[]>([]);

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
			<Filter filter={filter} setFilter={setFilter} />
			<Items displayed={displayed} onSelect={onSelect} />
			{children}
		</section>
	);
}
