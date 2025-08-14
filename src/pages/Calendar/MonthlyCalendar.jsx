// src/pages/Calendar/MonthlyCalendar.jsx
import React, { useState } from "react";
import "../../assets/scss/section/Calendar.scss";
import { useNavigate } from "react-router-dom";
import { useSchedule } from "../../contexts/ScheduleContext";
import { useCategory } from "../../contexts/CategoryContext";

/* ---------- 카테고리/색상 유틸 ---------- */
const resolveCategory = (item, categories) => {
  if (!item || !categories?.length) return undefined;

  const idCandidate =
    item.categoryId ??
    (item.category && typeof item.category === "object" ? item.category.id : undefined);

  const nameCandidateRaw =
    item.categoryName ??
    (typeof item.category === "string" ? item.category : item.category?.name);

  const idStr = idCandidate != null ? String(idCandidate) : null;
  const nameCandidate = typeof nameCandidateRaw === "string" ? nameCandidateRaw.trim() : "";

  if (idStr) {
    const byId = categories.find((c) => String(c.id) === idStr);
    if (byId) return byId;
  }
  if (nameCandidate) {
    const byName = categories.find((c) => c.name === nameCandidate);
    if (byName) return byName;
  }
  return undefined;
};

const getItemColor = (item, categories) => {
  const cat = resolveCategory(item, categories);
  return cat?.color || item?.color || "#8ED080";
};

/* ---------- 컴포넌트 ---------- */
function MonthlyCalendar() {
  const { schedules } = useSchedule();
  const { categories } = useCategory();

  // ✅ 초기 렌더 안전 가드: schedules가 undefined/배열/기타여도 빈 객체로 처리
  const safeSchedules =
    schedules && typeof schedules === "object" && !Array.isArray(schedules) ? schedules : {};

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);

  const navigate = useNavigate();

  const handleDateClick = (day) => {
    const month = currentMonth + 1;
    const dateStr = `${currentYear}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    navigate(`/daily/${dateStr}`);
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startBlank = (firstDay + 6) % 7; // 월=0 기준
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];

    // 앞쪽 공백
    for (let i = 0; i < startBlank; i++) {
      cells.push(<div key={`blank-${i}`} className="calendar-cell empty-cell"></div>);
    }

    // 날짜 셀
    for (let day = 1; day <= daysInMonth; day++) {
      const month = currentMonth + 1;
      const dateStr = `${currentYear}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      // ✅ 핵심: 안전 접근 (초기엔 항상 배열)
      const daySchedules = safeSchedules[dateStr] || [];
      const maxItemsToShow = 4;
      const displayedSchedules = daySchedules.slice(0, maxItemsToShow);

      cells.push(
        <div
          key={day}
          className="calendar-cell"
          onClick={() => handleDateClick(day)}
          style={{ cursor: "pointer" }}
        >
          <div className="date-number">{day}</div>
          <div className="badges">
            {displayedSchedules.map((item) => {
              const color = getItemColor(item, categories);
              const done = !!item.done;
              return (
                <span
                  key={item.id || `${dateStr}-${item.title}`}
                  className={`todo-badge ${done ? "done" : "pending"}`}
                  style={{ "--badge-color": color }}
                  title={item.title}
                >
                  {item.title}
                </span>
              );
            })}
            {daySchedules.length > maxItemsToShow && (
              <span className="todo-badge more-indicator" title="더 보기">
                …
              </span>
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="calendar-wrapper">
      <div className="monthly-calendar-page">
        {/* 연/월 제목 */}
        <div className="calendar-month-title">
          <span className="select-wrap">
            <button
              type="button"
              className="title-btn"
              onClick={() => {
                setIsYearSelectOpen((v) => !v);
                setIsMonthSelectOpen(false);
              }}
            >
              {currentYear}년
            </button>
            <div className="month-popup" data-open={isYearSelectOpen}>
              <ul>
                {Array.from({ length: 30 }, (_, i) => 2010 + i).map((y) => (
                  <li
                    key={y}
                    className={y === currentYear ? "active" : ""}
                    onClick={() => {
                      setCurrentYear(y);
                      setIsYearSelectOpen(false);
                    }}
                  >
                    {y}년
                  </li>
                ))}
              </ul>
            </div>
          </span>

          <span className="select-wrap">
            <button
              type="button"
              className="title-btn"
              onClick={() => {
                setIsMonthSelectOpen((v) => !v);
                setIsYearSelectOpen(false);
              }}
            >
              {currentMonth + 1}월
            </button>
            <div className="month-popup" data-open={isMonthSelectOpen}>
              <ul>
                {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                  <li
                    key={m}
                    className={m === currentMonth ? "active" : ""}
                    onClick={() => {
                      setCurrentMonth(m);
                      setIsMonthSelectOpen(false);
                    }}
                  >
                    {m + 1}월
                  </li>
                ))}
              </ul>
            </div>
          </span>
        </div>

        {/* 달력 */}
        <div className="calendar-box">
          <div className="calendar-header">
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyCalendar;
