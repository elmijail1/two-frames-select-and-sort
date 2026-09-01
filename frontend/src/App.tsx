import { FrameSelected } from "./components/FrameSelected";
import { FrameUnselected } from "./components/FrameUnselected";
import { useLiveUpdates } from "./hooks/useLiveUpdates";
import { useToggleQueue } from "./hooks/useToggleQueue";

function App() {
	useLiveUpdates(true);
	const { enqueue: enqueueSelection, pendingIds: pendingSelectedIds } =
		useToggleQueue();
	return (
		<main>
			<div className="flex max-md:flex-col max-md:items-center justify-center gap-4 w-[90%] py-8 mx-auto bg-[hsl(150,100%,80%)]">
				<FrameUnselected
					enqueueSelection={enqueueSelection}
					pendingSelectedIds={pendingSelectedIds}
				/>
				<FrameSelected
					enqueueSelection={enqueueSelection}
					pendingSelectedIds={pendingSelectedIds}
				/>
			</div>
		</main>
	);
}

export default App;
