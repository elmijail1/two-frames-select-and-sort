export interface IItem {
	id: number;
}

export type TSide = "before" | "after";
export type TItemType = "selected" | "unselected";

export type TSelectionAction = "select" | "unselect";
export interface ISpecificFrameProps {
	enqueueSelection: (id: number, action: TSelectionAction) => void;
	pendingSelectedIds: Map<number, TSelectionAction>;
}
