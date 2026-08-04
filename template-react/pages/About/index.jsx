import { useEffect, useState } from "react"
import Wrap from "@/components/Wrap"
import { useClickStore } from "@/store"
import Child from "./child"
import { AboutContext } from "./context"

export default () => {
	console.log("About render")

	// useState
	const [parentNum, setParentNum] = useState(0)

	// useContext
	const [numContext, setNumContext] = useState(0)

	// store
	const click = useClickStore((state) => state.click)

	const [isOnline, setIsOnline] = useState(navigator.onLine)

	useEffect(() => {
		// 订阅事件
		const handleOnline = () => setIsOnline(true)
		const handleOffline = () => setIsOnline(false)

		window.addEventListener("online", handleOnline)
		window.addEventListener("offline", handleOffline)
		console.log("注册")
		// 清理订阅
		return () => {
			console.log("注销")
			window.removeEventListener("online", handleOnline)
			window.removeEventListener("offline", handleOffline)
		}
	}, [])

	return (
		<Wrap>
			<div className="about">
				<AboutContext.Provider value={{ numContext, setNumContext }}>
					<div>{isOnline ? "在线" : "离线"}</div>
					<div>父组件的 useState {parentNum}</div>
					<div>父组件的 useTontext {numContext}</div>
					<div>父组件的 useStore {click}</div>
					<Child parentNum={parentNum} setParentNum={setParentNum} />
				</AboutContext.Provider>
			</div>
		</Wrap>
	)
}
