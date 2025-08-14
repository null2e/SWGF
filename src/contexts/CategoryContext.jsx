// src/contexts/CategoryContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { apiAddCategory, apiDeleteCategory, subscribeCategories } from "../api/categories";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) { setCategories([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeCategories(uid, (list) => { setCategories(list); setLoading(false); });
    return () => unsub();
  }, [uid]);

  const addCategory = async ({ name, color }) => {
    if (!uid) throw new Error("로그인이 필요합니다.");
    await apiAddCategory({ uid, name, color });
  };

  const deleteCategory = async (categoryId) => {
    if (!uid) throw new Error("로그인이 필요합니다.");
    await apiDeleteCategory({ uid, categoryId });
  };

  const value = useMemo(
    () => ({ uid, categories, loading, addCategory, deleteCategory }),
    [uid, categories, loading]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory는 CategoryProvider 내부에서 사용해야 합니다.");
  return ctx;
}
