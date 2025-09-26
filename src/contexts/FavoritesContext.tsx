import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => boolean; // returns true if added, false if removed
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback(
    (id: string): boolean => {
      setFavorites((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
          return newSet;
        } else {
          newSet.add(id);
          return newSet;
        }
      });
      return !favorites.has(id);
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.has(id);
    },
    [favorites]
  );

  const value: FavoritesContextType = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, toggleFavorite, isFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
