import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  // État
  toasts: Toast[];
  isRefreshing: boolean;
  isBottomSheetOpen: boolean;
  activeBottomSheet: string | null;
  bottomSheetData: any;
  
  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  
  setRefreshing: (isRefreshing: boolean) => void;
  
  openBottomSheet: (sheetName: string, data?: any) => void;
  closeBottomSheet: () => void;
  setBottomSheetData: (data: any) => void;
}

/**
 * Store Zustand pour gérer l'interface utilisateur
 */
export const useUIStore = create<UIState>((set, get) => ({
  // État initial
  toasts: [],
  isRefreshing: false,
  isBottomSheetOpen: false,
  activeBottomSheet: null,
  bottomSheetData: null,
  
  // Actions pour les toasts
  showToast: (toast) => {
    // Générer un ID unique
    const id = `toast-${Date.now()}`;
    const duration = toast.duration || 3000; // 3 secondes par défaut
    
    // Ajouter le toast
    set(state => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    
    // Programmer sa suppression
    setTimeout(() => {
      get().hideToast(id);
    }, duration);
    
    return id;
  },
  
  hideToast: (id) => set(state => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  })),
  
  clearToasts: () => set({ toasts: [] }),
  
  // Actions pour le rafraîchissement
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  
  // Actions pour les bottom sheets
  openBottomSheet: (sheetName, data = null) => set({
    isBottomSheetOpen: true,
    activeBottomSheet: sheetName,
    bottomSheetData: data
  }),
  
  closeBottomSheet: () => set({
    isBottomSheetOpen: false,
    activeBottomSheet: null,
    bottomSheetData: null
  }),
  
  setBottomSheetData: (data) => set({ bottomSheetData: data })
}));