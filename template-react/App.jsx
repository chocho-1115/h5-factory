import "./assets/css/main.scss"

import { BrowserRouter, Route, Routes } from "react-router"
import { remInit } from "~/common/rem.js"
import { browserDetect } from "~/core/utils"

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
	console.log("App render")
	return (
		<BrowserRouter>
			<Header />
			<div className="content">
				<Routes>
					<Route index element={<Index />} />
					<Route
						path="/about"
						element={<About />}
					/>
				</Routes>
			</div>
		</BrowserRouter>
	)
}
