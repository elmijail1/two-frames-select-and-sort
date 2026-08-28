import { FrameSelected } from "./components/FrameSelected";
import { FrameUnselected } from "./components/FrameUnselected";

function App() {
	return (
		<main>
			<div
				style={{
					display: "flex",
					width: "90%",
					justifyContent: "center",
					gap: "1rem",
					backgroundColor: "hsl(150, 100%, 80%)",
					margin: "0 auto",
				}}
			>
				<FrameUnselected />
				<FrameSelected />
			</div>
		</main>
	);
}

export default App;
