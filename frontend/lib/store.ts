import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DashboardState {
  openServices: string[]
  addService: (serviceId: string) => void
  removeService: (serviceId: string) => void
  clearServices: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      openServices: [],
      addService: (serviceId) =>
        set((state) => ({
          openServices: state.openServices.includes(serviceId)
            ? state.openServices
            : [...state.openServices, serviceId],
        })),
      removeService: (serviceId) =>
        set((state) => ({
          openServices: state.openServices.filter((id) => id !== serviceId),
        })),
      clearServices: () => set({ openServices: [] }),
    }),
    {
      name: "dashboard-storage",
    },
  ),
)
