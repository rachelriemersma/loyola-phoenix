import React, { createContext, useContext, useState } from 'react';

const HOME_CATEGORIES = [103, 111, 112, 108, 107, 110, 113, 740, 102, 746, 741, 738, 739, 99, 2068, 744, 136, 675, 676, 135, 745, 2470, 761, 3548, 104, 220, 3920, 142, 751, 750, 797, 749, 119, 2439, 3478, 3760, 3762, 3763, 3764, 3765];

export const CATEGORIES = [
  { id: HOME_CATEGORIES, name: 'Home' },
  { id: [103, 111, 112, 108, 107, 110, 113, 740], name: 'News' },
  { id: [102, 746, 741, 738, 739], name: 'Sports' },
  { id: [99, 2068, 744, 136, 675, 676, 135, 745, 2470, 761, 3548], name: 'Arts' },
  { id: [104, 220, 3920, 142, 751, 750, 797, 749, 119, 2439, 3478], name: 'Opinion' },
  { id: [3760, 3762, 3763, 3764, 3765], name: 'Español' },
];

type CategoryContextType = {
  selectedCategory: number[];
  selectedName: string;
  setCategory: (id: number[], name: string) => void;
  isSearching: boolean;
  searchQuery: string;
  setIsSearching: (value: boolean) => void;
  setSearchQuery: (value: string) => void;
};

const CategoryContext = createContext<CategoryContextType>({
  selectedCategory: HOME_CATEGORIES,
  selectedName: 'Home',
  setCategory: () => {},
  isSearching: false,
  searchQuery: '',
  setIsSearching: () => {},
  setSearchQuery: () => {},
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState(HOME_CATEGORIES);
  const [selectedName, setSelectedName] = useState('Home');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const setCategory = (id: number[], name: string) => {
    setSelectedCategory(id);
    setSelectedName(name);
  };

  return (
    <CategoryContext.Provider value={{ selectedCategory, selectedName, setCategory, isSearching, searchQuery, setIsSearching, setSearchQuery }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);
