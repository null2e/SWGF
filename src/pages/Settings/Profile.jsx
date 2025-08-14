// src/pages/Settings/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../assets/scss/section/Profile.scss";

export default function Profile() {
  const nav = useNavigate();

  // 더미 메타 (추후 API 연동)
  const userId = "sungshin1234";
  const coin = 2025;
  const level = 1;

  // 이름 편집 + 영구 저장
  const LOCAL_KEY = "mypage.username";
  const [username, setUsername] = useState("김수정");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setUsername(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, username);
  }, [username]);

  const startEdit = () => {
    setDraft(username);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const save = () => {
    const v = draft.trim();
    if (v) setUsername(v);
    setIsEditing(false);
  };
  const cancel = () => {
    setDraft(username);
    setIsEditing(false);
  };

  return (
    <div className="mypage">
      {/* 헤더 */}
      <div className="Profile-header">
        <img className="back" src="/img/back.png" alt="뒤로" onClick={() => nav(-1)} />
        <h1>마이페이지</h1>
      </div>

      {/* 탭 (URL로 active 결정) */}
      <div className="profile-tabs" role="tablist">
        <NavLink to="/profile" end className={({isActive}) => `tab ${isActive ? "active" : ""}`}>Profile</NavLink>
        <NavLink to="/level" className={({isActive}) => `tab ${isActive ? "active" : ""}`}>level</NavLink>
        <NavLink to="/followers" className={({isActive}) => `tab ${isActive ? "active" : ""}`}>Followers</NavLink>
      </div>

      {/* 섹션 타이틀 + 메타 */}
      <div className="section-row">
        <h2 className="section-title">프로필 설정</h2>
        <div className="meta">
          <div className="coin"><img src="/img/coin.png" alt="coin" /><span className="metric">{coin}</span></div>
          <div className="level"><img src="/img/level.png" alt="level" /><span className="metric">Lv.{level}</span></div>
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="card profile-card">
        <div className="row editable">
          <input
            ref={inputRef}
            className={`inline-input ${isEditing ? "editing" : ""}`}
            type="text"
            value={isEditing ? draft : username}
            onChange={(e) => setDraft(e.target.value)}
            readOnly={!isEditing}
            placeholder="이름"
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
          />

          {!isEditing ? (
            <button className="icon-btn" type="button" aria-label="이름 수정" onClick={startEdit}>
              <img className="trailing-icon" src="/img/re.png" alt="" />
            </button>
          ) : (
            <div className="edit-actions">
              <button className="icon-btn" type="button" aria-label="저장" onClick={save}>
                <img className="trailing-icon" src="/img/check.png" alt="" />
              </button>
              <button className="icon-btn" type="button" aria-label="취소" onClick={cancel}>
                <img className="trailing-icon" src="/img/close.png" alt="" />
              </button>
            </div>
          )}
        </div>

        <div className="divider" />

        <div className="row">
          <span className="subtext">{userId}</span>
        </div>
      </div>

      {/* 보안 섹션 */}
      <h2 className="section-title security-title">보안</h2>
      <div className="card security-card">
        <button className="row" type="button" onClick={() => nav("/settings/verify-password")}>
          <span className="row-text">암호 확인</span>
          <img className="trailing-icon" src="/img/chevron-right.png" alt="" />
        </button>

        <div className="divider" />

        <button className="row" type="button" onClick={() => nav("/settings/change-password")}>
          <span className="row-text">암호 변경</span>
          <img className="trailing-icon" src="/img/re.png" alt="" />
        </button>
      </div>
    </div>
  );
}
