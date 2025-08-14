// src/pages/Calendar/Category.jsx
import { useCategory } from "../../contexts/CategoryContext";
import { useState } from "react";
import "../../assets/scss/section/Category.scss";

function Category({ closePopup }) {
  const { categories, addCategory, deleteCategory, loading } = useCategory();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#a2d2ff");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submitAdd = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName || busy) return;
    try {
      setBusy(true);
      setMsg("추가 중…");
      await addCategory({ name: trimmedName, color: newColor });
      setNewName("");
      setNewColor("#a2d2ff");
      setMsg("✅ 추가 완료");
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(""), 1200);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 방지
    await submitAdd();
  };

  const onKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 엔터 기본 제출 방지
      await submitAdd();
    }
  };

  const handleDelete = async (categoryId, nameForConfirm) => {
    if (busy) return;
    if (!window.confirm(`'${nameForConfirm}' 카테고리를 삭제할까요?`)) return;
    try {
      setBusy(true);
      setMsg("삭제 중…");
      await deleteCategory(categoryId);
      setMsg("✅ 삭제 완료");
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(""), 1200);
    }
  };

  return (
    <div className="C-popup">
      {/* 헤더 */}
      <div className="popup-header">
        <h2 className="title">카테고리</h2>
        <button className="close-btn" onClick={closePopup} aria-label="닫기">✕</button>
      </div>

      {/* 입력영역: 기존 클래스/구조 유지 */}
      <form className="new-category" onSubmit={onSubmit}>
        <label className="color-picker">
          <input
            className="color-input"
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
        </label>

        <input
          className="name-input"
          type="text"
          placeholder="카테고리를 작성하세요."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
        />

        {/* 버튼 type 명시 */}
        <button className="add-btn" type="submit" aria-label="추가" disabled={busy}>
          ＋
        </button>
      </form>

      {msg && (
        <p className="helper-msg" style={{ marginTop: 8, fontSize: 12 }}>
          {msg}
        </p>
      )}

      {/* 리스트: 기존 클래스/구조 그대로 */}
      <div className="category-list">
        {loading ? (
          <div className="category-item" style={{ justifyContent: "center", opacity: 0.7 }}>
            로딩 중…
          </div>
        ) : categories.length === 0 ? (
          <div className="category-item" style={{ justifyContent: "center", opacity: 0.7 }}>
            아직 카테고리가 없어요.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id || cat.name} className="category-item">
              <div className="item-left">
                <span className="color-dot" style={{ backgroundColor: cat.color }} />
                <span className="name">{cat.name}</span>
              </div>
              {!cat.locked && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  aria-label={`${cat.name} 삭제`}
                  title="삭제"
                  disabled={busy}
                >
                  <img className="delete-icon" src="/img/trash.png" alt="" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Category;
