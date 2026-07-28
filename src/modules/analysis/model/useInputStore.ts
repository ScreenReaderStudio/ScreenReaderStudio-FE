import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InputState {
  code: string;
  url: string;
  setCode: (code: string) => void;
  setUrl: (url: string) => void;
}

export const useInputStore = create<InputState>()(
  persist(
    (set) => ({
      code: '',
      url: '',

      setCode: (code) => set({ code }),

      setUrl: (url) => set({ url }),
    }),
    {
      name: 'input-storage',
    }
  )
);
