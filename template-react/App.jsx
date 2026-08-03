import "./assets/css/main.scss"
import { useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { remInit } from "~/common/rem.js"
import { browserDetect } from "~/core/utils"
import { numClick } from "./assets/js/context"
import Header from "./containers/Header"
import About from "./pages/About"
import Index from "./pages/Home"

remInit({
	baseWidth: 750,
	maxWidth: browserDetect().isPc ? 750 : null,
	viewportMinHeight: 1334,
	isLandscape: false,
	// zoomOutCriticalValue: !browserDetect().isPc ? 1 / 1 : null,
	// zoomOutCriticalValue: 1334/(750-400),
})

export default function App() {
	const [globalNum, setGlobalNum] = useState(0)

	return (
		<BrowserRouter>
			<Header />
			{/* biome-ignore lint/a11y/noStaticElementInteractions: 测试 demo */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: 测试 demo */}
			<div className="content">
				<numClick.Provider value={globalNum}>
					<Routes>
						<Route index element={<Index />} />
						<Route
							path="/about"
							element={<About setGlobalNum={setGlobalNum} />}
						/>
					</Routes>
				</numClick.Provider>
			</div>
		</BrowserRouter>
	)
}
