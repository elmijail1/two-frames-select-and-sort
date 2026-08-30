import { FrameSelected } from "./components/FrameSelected";
import { FrameUnselected } from "./components/FrameUnselected";
import { useLiveUpdates } from "./hooks/useLiveUpdates";

function App() {
	useLiveUpdates(true);
	return (
		<main>
			<div className="flex max-md:flex-col max-md:items-center justify-center gap-4 w-[90%] py-8 mx-auto bg-[hsl(150,100%,80%)]">
				<FrameUnselected />
				<FrameSelected />
			</div>
		</main>
	);
}

export default App;
