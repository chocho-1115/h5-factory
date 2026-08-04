import { useContext } from "react"
import Wrap from "@/components/Wrap"
import { useClickStore } from "@/store"
import { AboutContext } from "./context"

export default ({ parentNum, setParentNum }) => {
	console.log("About/child render")

	// useState
	function handleClick() {
		setParentNum(parentNum + 1)
	}
	// useContext
	const { numContext, setNumContext } = useContext(AboutContext)
	function handleClick2() {
		console.log(
			"会触发所有子组件的render，这是与vue在数据响应上的重要区别，react的性能优化也是围绕这一特性进行的。",
		)
		setNumContext(numContext + 1)
	}
	// useStore
	const click = useClickStore((state) => state.click)
	const add = useClickStore((state) => state.add)
	const clear = useClickStore((state) => state.clear)

	return (
		<Wrap>
			<div className="about">
				子组件的 useState: {parentNum}{" "}
				<button type="button" onClick={handleClick}>
					add
				</button>
				（父组件的useState变量）
				<br />
				子组件的 useContext: {numContext}{" "}
				<button type="button" onClick={handleClick2}>
					add
				</button>
				（父组件变量）
				<br />
				子组件的 useStore: {click}{" "}
				<button type="button" onClick={add}>
					add
				</button>
				<button type="button" onClick={clear}>
					clear
				</button>
				（store变量）
				<br />
			</div>
		</Wrap>
	)
}
