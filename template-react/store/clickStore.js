import { create } from "zustand"
import { persist } from "zustand/middleware" // ✅ 引入持久化中间件

const useClickStore = create(
	persist(
		(set) => ({
			click: 0,
			add: () => set((state) => ({ click: state.click + 1 })),
			clear: () => set({ click: 0 }),
		}),
		{
			name: "click-storage", // localStorage 的 key
		},
	),
)

export { useClickStore }
