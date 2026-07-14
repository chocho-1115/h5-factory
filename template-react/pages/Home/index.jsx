import * as style from "./styles.module.scss"
import { formatTime } from "~/core/utils"
import Wrap from "@/components/Wrap"

export default () => {
	console.log("Home render")
	return (
		<Wrap className={style.wrap}>
			<span>{formatTime("yyyy/MM/dd h:m:s")}</span>
		</Wrap>
	)
}
