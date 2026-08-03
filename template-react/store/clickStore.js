// store/userStore.js
import { create } from "zustand"

const useClickStore = create((set) => ({
	click: 0,
	add: () => set((state) => ({ click: state.click + 1 })),
	clear: () => set({ click: 0 }),
}))

export { useClickStore }
