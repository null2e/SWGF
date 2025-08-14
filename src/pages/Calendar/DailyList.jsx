// src/pages/Calendar/DailyList.jsx
import { useCategory } from "../../contexts/CategoryContext";
import Category from "./Category";
import { useSchedule } from "../../contexts/ScheduleContext";
import AddDailyItem from "./AddDailyItem";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import "../../assets/scss/section/DailyList.scss";

/* ---------- 유틸 ---------- */
const getIsPublic = (item) => {
  if (typeof item?.isPublic === "boolean") return item.isPublic;
  if (typeof item?.public === "boolean") return item.public;
  if (typeof item?.isPublic === "string") return item.isPublic === "true";
  if (typeof item?.public === "string") return item.public === "true";
  return true; // 기본값: 공개
};

const sanitizeDate = (raw) => {
  if (!raw || typeof raw !== "string") return new Date();
  // YYYY-MM-DD 형식만 허용, 아니면 오늘로 대체
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
};

function DailyList() {
  const { date } = useParams();
  const nav = useNavigate();

  const { categories, setCategories, updateCategoryColor } = useCategory?.() || {
    categories: [],
  };
  const { schedules } = useSchedule?.() || { schedules: {} };

  // ✅ schedules가 아직 로드 전이거나 형태가 다르면 안전한 빈 객체로 처리
  const safeSchedules = useMemo(
    () =>
      schedules && typeof schedules === "object" && !Array.isArray(schedules)
        ? schedules
        : {},
    [schedules]
  );

  const [checkedItems, setCheckedItems] = useState({});
  const [showCategory, setShowCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // ✅ 파라미터 보정
  const [currentDate, setCurrentDate] = useState(sanitizeDate(date));

  const colorInputRef = useRef(null);
  const [colorTargetName, setColorTargetName] = useState(null);

  const defaultCategoryName = "루틴";
  const defaultCategory = categories?.find?.((cat) => cat.name === defaultCategoryName);
  const userCategories = categories?.filter?.((cat) => cat.name !== defaultCategoryName) || [];

  // 지금은 내가 보는 화면이라고 가정. 친구 보기면 false로.
  const isOwnerView = true;

  const getFormattedDate = (d) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
  };

  const currentDateStr = useMemo(
    () => currentDate.toISOString().slice(0, 10),
    [currentDate]
  );

  // ✅ 초기 체크박스 상태 세팅 (undefined 안전)
  useEffect(() => {
    const todayArr = safeSchedules[currentDateStr] || [];
    const init = {};
    todayArr.forEach((item) => {
      if (item?.id != null) init[item.id] = false;
    });
    setCheckedItems(init);
  }, [safeSchedules, currentDateStr]);

  const toggleCheck = (id) =>
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const displayDate = getFormattedDate(currentDate);

  const openColorPickerFor = (name) => {
    setColorTargetName(name);
    setTimeout(() => colorInputRef.current?.click(), 0);
  };

  const handleColorChange = (e) => {
    const hex = e.target.value;
    const target = categories?.find?.((c) => c.name === colorTargetName);
    if (!target) return;

    if (typeof updateCategoryColor === "function" && target.id != null) {
      updateCategoryColor(target.id, hex);
    } else if (typeof setCategories === "function") {
      setCategories((prev) =>
        prev.map((c) => (c.name === colorTargetName ? { ...c, color: hex } : c))
      );
    }
  };

  const renderTasks = (cat) => {
    const dayList = safeSchedules[currentDateStr] || [];

    return dayList
      .filter((item) => {
        // 카테고리 필터: item.category가 객체/문자열/없음 모두 대비
        const itemCatName =
          (typeof item?.category === "string" && item.category) ||
          (typeof item?.category === "object" && item.category?.name) ||
          item?.categoryName ||
          "";
        return itemCatName === cat.name;
      })
      .filter((item) => (isOwnerView ? true : getIsPublic(item))) // 친구 보기면 비공개 숨김
      .map((item, index) => {
        const isPublic = getIsPublic(item);
        const isDone = !!item?.done;

        return (
          <div
            key={item?.id ?? `${currentDateStr}-${cat.name}-${index}`}
            className={`task-item ${isDone ? "done" : ""}`} // 완료는 스타일만
            onClick={() => {
              setEditItem({
                ...item,
                date:
                  typeof item?.date === "string"
                    ? item.date
                    : item?.date
                    ? new Date(item.date).toISOString().slice(0, 10)
                    : currentDateStr,
                index,
                startDate: item?.startDate || currentDateStr,
                endDate: item?.endDate || currentDateStr,
              });
              setShowAddItem(true);
            }}
          >
            <input
              type="checkbox"
              checked={!!checkedItems[item?.id]}
              onClick={(e) => e.stopPropagation()}
              onChange={() => item?.id != null && toggleCheck(item.id)}
              aria-label="완료 체크"
            />

            <span className="task-title">{item?.title ?? "제목 없음"}</span>

            {!isPublic && (
              <span className="task-lock" aria-label="비공개">
                🔒
              </span>
            )}
          </div>
        );
      });
  };

  return (
    <div className="DailyList-wrapper">
      <div className="DailyList-page">
        {/* 헤더 */}
        <header className="page-header">
          <img
            src="/img/back.png"
            alt=""
            className="back"
            onClick={() => nav("/calendar")}
          />
          <h1 className="title">일일리스트</h1>
          <img
            src="/img/gear.png"
            alt=""
            className="gear"
            onClick={() => nav("/settings")}
          />
        </header>

        {/* 날짜 */}
        <div className="date-and-action">
          <p className="date-text">{displayDate}</p>
          {/* 카테고리 버튼 */}
          <button onClick={() => setShowCategory(true)} className="category-open-btn">
            카테고리
          </button>
        </div>

        {/* 숨김 컬러 피커 */}
        <input
          ref={colorInputRef}
          type="color"
          className="cat-color-input"
          style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
          onChange={handleColorChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* 기본 카테고리(루틴) */}
        {defaultCategory && (
          <div className="dl-category-group">
            <div className="dl-category-block">
              <div className="category-header">
                <div className="category-title">
                  <button
                    type="button"
                    className="color-dot"
                    style={{ backgroundColor: defaultCategory.color }}
                    onClick={() => openColorPickerFor(defaultCategory.name)}
                    title="색상 변경"
                    aria-label="카테고리 색상 변경"
                  />
                  <span className="category-name" style={{ color: defaultCategory.color }}>
                    {defaultCategory.name}
                  </span>
                  {defaultCategory.locked && <span className="lock">🔒</span>}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(defaultCategory.name);
                    setEditItem(null);
                    setShowAddItem(true);
                  }}
                  className="add-button"
                >
                  ＋
                </button>
              </div>
            </div>
            {renderTasks(defaultCategory)}
          </div>
        )}

        {/* 사용자 카테고리들 */}
        {userCategories.map((cat) => (
          <div key={cat.name} className="dl-category-group">
            <div className="dl-category-block">
              <div className="category-header">
                <div className="category-title">
                  <button
                    type="button"
                    className="color-dot"
                    style={{ backgroundColor: cat.color }}
                    onClick={() => openColorPickerFor(cat.name)}
                    title="색상 변경"
                    aria-label={`${cat.name} 색상 변경`}
                  />
                  <span className="category-name" style={{ color: cat.color }}>
                    {cat.name}
                  </span>
                  {cat.locked && <span className="lock">🔒</span>}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setEditItem(null);
                    setShowAddItem(true);
                  }}
                  className="add-button"
                >
                  ＋
                </button>
              </div>
            </div>
            {renderTasks(cat)}
          </div>
        ))}
      </div>

      {/* 오버레이 */}
      {showAddItem && (
        <div className="overlay">
          <AddDailyItem
            date={currentDateStr}
            category={selectedCategory}
            editItem={editItem}
            closePopup={() => setShowAddItem(false)}
          />
        </div>
      )}
      {showCategory && (
        <div className="overlay">
          <Category closePopup={() => setShowCategory(false)} />
        </div>
      )}
    </div>
  );
}

export default DailyList;
