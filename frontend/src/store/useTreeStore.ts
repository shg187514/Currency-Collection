import { create } from 'zustand';

export interface DraftNode {
  id: string;
  parentId: string | null;
}

interface TreeState {
  expandedNodeIds: Set<string>;
  searchQuery: string;
  isSearchModalOpen: boolean;
  selectedTagFilterId: string | null;
  recentNodes: string[];
  draftNodes: DraftNode[];
  
  toggleNode: (id: string, forceState?: boolean) => void;
  expandToNode: (pathToNode: string[]) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setSelectedTagFilterId: (id: string | null) => void;
  addRecentNode: (id: string) => void;
  
  addDraftNode: (parentId: string | null) => string;
  removeDraftNode: (id: string) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  expandedNodeIds: new Set<string>(),
  searchQuery: '',
  isSearchModalOpen: false,
  selectedTagFilterId: null,
  recentNodes: [],
  draftNodes: [],

  addDraftNode: (parentId) => {
    const id = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      draftNodes: [...state.draftNodes, { id, parentId }]
    }));
    return id;
  },

  removeDraftNode: (id) => set((state) => ({
    draftNodes: state.draftNodes.filter(d => d.id !== id)
  })),

  addRecentNode: (id) => set((state) => {
    // Update recent nodes (prepend, remove duplicates, cap at 10)
    const newRecent = [id, ...state.recentNodes.filter(nId => nId !== id)].slice(0, 10);
    return { recentNodes: newRecent };
  }),

  toggleNode: (id, forceState) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      const isExpanded = newExpanded.has(id);

      if (forceState !== undefined) {
        if (forceState) newExpanded.add(id);
        else newExpanded.delete(id);
      } else {
        if (isExpanded) newExpanded.delete(id);
        else newExpanded.add(id);
      }

      return { expandedNodeIds: newExpanded };
    }),

  expandToNode: (pathToNode) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      pathToNode.forEach((id) => newExpanded.add(id));
      return { expandedNodeIds: newExpanded };
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
  setSelectedTagFilterId: (id) => set({ selectedTagFilterId: id }),
}));
