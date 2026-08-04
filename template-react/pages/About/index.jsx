import { useState } from "react"
import { AboutContext } from "./context"
import Wrap from "@/components/Wrap"
import Child from "./child"

import { useClickStore } from "@/store"

export default () => {
	console.log("About render")

	// useState
	const [parentNum, setParentNum] = useState(0)
	
	// useContext
	const [numContext, setNumContext] = useState(0)

	const click = useClickStore((state) => state.click)

	return (
		<Wrap>
			<div className="about">
				<AboutContext.Provider value={{numContext, setNumContext}}>
					<div>
						父组件的 useState {parentNum}
					</div>
					<div>
						父组件的 useTontext {numContext}
					</div>
					<div>
						父组件的 useStore {click}
					</div>
					<Child parentNum={parentNum} setParentNum={setParentNum} />

				</AboutContext.Provider>

			</div>
		</Wrap>
	)
}
