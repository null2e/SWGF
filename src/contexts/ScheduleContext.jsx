// src/contexts/ScheduleContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { apiAddTodo, apiDeleteTodo, subscribeAllTodos } from "../api/todos";

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [todos, setTodos] = useState([]); // [{id, title, categoryId, startDate, endDate, repeat, ...}]
  const [loading, setLoading] = useState(true);

  // 로그인 추적
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  // 실시간 구독
  useEffect(() => {
    if (!uid) {
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeAllTodos(uid, (list) => {
      setTodos(list || []);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // ===== 공개 API =====

  // ➕ 추가
  const addTodo = async ({
    title,
    categoryId,
    dateKey, // "YYYY-MM-DD" (옵션)
    startDate,
    endDate,
    repeat = "none",
    isPublic = false,
    memo = "",
  }) => {
    if (!uid) throw new Error("로그인이 필요합니다.");
    const s = startDate || dateKey;
    const e = endDate || dateKey;
    if (!title?.trim() || !categoryId || !s || !e) {
      throw new Error("title / categoryId / date가 필요합니다.");
    }
    return apiAddTodo({
      uid,
      title: title.trim(),
      categoryId,
      startDate: s,
      endDate: e,
      repeat,
      isPublic,
      memo,
    });
  };

  // 🗑️ 삭제
  const deleteTodo = async (todoId) => {
    if (!uid) throw new Error("로그인이 필요합니다.");
    if (!todoId) throw new Error("todoId가 필요합니다.");
    return apiDeleteTodo({ uid, todoId });
  };

  // 날짜별 필터 헬퍼 (단일 날짜가 기간 사이에 포함될 때)
  const getTodosByDate = (dateKey) =>
    (todos || []).filter((t) => t.startDate <= dateKey && t.endDate >= dateKey);

  const value = useMemo(
    () => ({
      uid,
      todos,
      loading,
      addTodo,
      deleteTodo,
      getTodosByDate,
    }),
    [uid, todos, loading]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx)
    throw new Error("useSchedule은 ScheduleProvider 내부에서 사용해야 합니다.");
  return ctx;
}
