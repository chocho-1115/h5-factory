import { useContext, useState } from "react"
import { numClick } from "@/assets/js/context"
import Wrap from "@/components/Wrap"
import { useClickStore } from "@/store"

export default ({ setGlobalNum }) => {
	console.log("About render")

	const numClick_data = useContext(numClick)
	const [num, setNum] = useState(0)

	const click = useClickStore((state) => state.click)
	const add = useClickStore((state) => state.add)

	function handleClick() {
		setNum(num + 1)
	}

	function handleClick2() {
		console.log(
			"会触发所有子组件的render，这是与vue在数据响应上的重要区别，react的性能优化也是围绕这一特性进行的。",
		)
		setGlobalNum(numClick_data + 1)
	}

	return (
		<Wrap>
			<div className="about">
				useState: {num}{" "}
				<button type="button" onClick={handleClick}>
					add
				</button>
				（组件变量）
				<br />
				useContext: {numClick_data}{" "}
				<button type="button" onClick={handleClick2}>
					add
				</button>
				（父组件变量）
				<br />
				useStore: {click}{" "}
				<button type="button" onClick={add}>
					add
				</button>
				（store变量）
				<br />
			</div>
		</Wrap>
	)
}
