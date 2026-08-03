// store/userStore.js
import { create } from "zustand"

const useUserStore = create((set) => ({
	userInfo: null,
	setUserInfo: (data) => set({ userInfo: data }),
	clearUser: () => set({ userInfo: null }),
}))

export { useUserStore }
