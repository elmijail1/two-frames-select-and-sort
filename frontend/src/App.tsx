import { FrameSelected } from "./components/FrameSelected";
import { FrameUnselected } from "./components/FrameUnselected";

function App() {
	return (
		<main>
			<div className="flex justify-center gap-4 w-[90%] py-8 mx-auto bg-[hsl(150,100%,80%)]">
				<FrameUnselected />
				<FrameSelected />
			</div>
		</main>
	);
}

export default App;
