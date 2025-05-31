import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Reference {
  id: string;
  title: string;
  authors: string[];
  type: "article" | "book" | "conference" | "thesis" | "website";
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  tags: string[];
  notes?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReferenceStore {
  references: Reference[];
  selectedReference: Reference | null;
  searchQuery: string;
  isLoading: boolean;
  filter: {
    type: string;
    tags: string[];
    year: { min?: number; max?: number };
  };

  // Actions
  setReferences: (references: Reference[]) => void;
  addReference: (reference: Reference) => void;
  updateReference: (id: string, updates: Partial<Reference>) => void;
  removeReference: (id: string) => void;
  setSelectedReference: (reference: Reference | null) => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setFilter: (filter: Partial<ReferenceStore["filter"]>) => void;
  resetFilters: () => void;
}

export const useReferenceStore = create<ReferenceStore>()(
  devtools(
    (set, get) => ({
      references: [],
      selectedReference: null,
      searchQuery: "",
      isLoading: false,
      filter: {
        type: "",
        tags: [],
        year: {},
      },

      setReferences: (references) =>
        set({ references }, false, "setReferences"),

      addReference: (reference) =>
        set(
          (state) => ({
            references: [reference, ...state.references],
          }),
          false,
          "addReference"
        ),

      updateReference: (id, updates) =>
        set(
          (state) => ({
            references: state.references.map((ref) =>
              ref.id === id ? { ...ref, ...updates } : ref
            ),
          }),
          false,
          "updateReference"
        ),

      removeReference: (id) =>
        set(
          (state) => ({
            references: state.references.filter((ref) => ref.id !== id),
            selectedReference:
              state.selectedReference?.id === id
                ? null
                : state.selectedReference,
          }),
          false,
          "removeReference"
        ),

      setSelectedReference: (reference) =>
        set({ selectedReference: reference }, false, "setSelectedReference"),

      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),

      setIsLoading: (loading) =>
        set({ isLoading: loading }, false, "setIsLoading"),

      setFilter: (newFilter) =>
        set(
          (state) => ({
            filter: { ...state.filter, ...newFilter },
          }),
          false,
          "setFilter"
        ),

      resetFilters: () =>
        set(
          {
            filter: {
              type: "",
              tags: [],
              year: {},
            },
            searchQuery: "",
          },
          false,
          "resetFilters"
        ),
    }),
    {
      name: "reference-store",
    }
  )
);
