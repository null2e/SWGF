// src/pages/Settings/Level.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/scss/section/level.scss";

export default function Level() {
  // 데모 값 (추후 API/Context로 교체)
  const currentLevel = 1;
  const currentPoints = 3;
  const targetPoints = 10;

  // 레벨 카드: 처음엔 12개만 보이게
  const totalLevels = 15;
  const [visibleCount, setVisibleCount] = useState(12);
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

  // 진행도
  const percent = useMemo(
    () => Math.max(0, Math.min(100, (currentPoints / targetPoints) * 100)),
    [currentPoints, targetPoints]
  );
  const remainPoints = Math.max(0, targetPoints - currentPoints);

  const nav = useNavigate();

  return (
    <div className="mypage">
      {/* 헤더 */}
      <div className="Profile-header">
        <img className="back" src="/img/back.png" alt="뒤로" onClick={() => nav(-1)} />
        <h1>마이페이지</h1>
      </div>

      {/* 탭 & 콘텐츠 */}
      <div className="after-header">
        <div className="profile-tabs" role="tablist">
          <NavLink to="/profile" end className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            Profile
          </NavLink>
          <NavLink to="/level" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            level
          </NavLink>
          <NavLink to="/followers" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            Followers
          </NavLink>
        </div>

        {/* 레벨 페이지 내용 */}
        <div className="level-page">
          <div className="level-header">
            <div className="title-row">
              <h2 className="title">
                <span className="lvl-number">&nbsp;{currentLevel} Level</span>
              </h2>
              <span className="progress-number">
                {currentPoints} / {targetPoints}
              </span>
            </div>

            {/* 막대 그래프 */}
            <div className="level-bar">
              <div className="fill" style={{ width: `${percent}%` }} />
            </div>

            {/* 안내 박스 */}
            <div className="next-info">
              <p>다음 {currentLevel + 1} Level까지 {remainPoints}개의 포인트가 남았습니다.</p>
            </div>
          </div>

          {/* 레벨 카드 (처음 12개만) */}
          <div className="level-grid no-scroll">
            {levels.slice(0, visibleCount).map((lv) => (
              <div className="level-card" key={lv}>
                <span className="level-text">Lv {lv}</span>
              </div>
            ))}
          </div>

          {/* 더 보기 버튼 (남은 게 있을 때만 노출) */}
          {visibleCount < totalLevels && (
            <button
              type="button"
              className="level-more"
              onClick={() => setVisibleCount(totalLevels)} // 한 번에 모두 보기 (원하면 +3씩도 가능)
            >
              더 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
