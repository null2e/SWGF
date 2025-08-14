import { useState, useEffect } from "react";
import { useCategory } from "../../contexts/CategoryContext";
import { useSchedule } from "../../contexts/ScheduleContext";
import { auth } from "../../firebase";
import "../../assets/scss/section/AddDailyItem.scss";

/** 반복값 매핑: 프론트 ↔ 백엔드 */
const mapRepeatToServer = (r) => {
  if (r === "매일") return "daily";
  if (r === "매주") return "weekly";
  if (r === "매달") return "monthly";
  return "none"; // '한번'
};

function AddDailyItem({ date, category, closePopup, editItem = null }) {
  const { categories } = useCategory();
  const { addTodo, deleteTodo } = useSchedule(); // ✅ 컨텍스트 메서드만 사용

  const categoryInfo = categories?.find((c) => c.name === category);
  const isEditMode = !!editItem;

  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState("한번");
  const [isPublic, setIsPublic] = useState(false);
  const [memo, setMemo] = useState("");
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isEditMode) {
      setTitle(editItem.title || "");
      setRepeat(editItem.repeat || "한번");
      setIsPublic(
        typeof editItem.isPublic === "boolean"
          ? editItem.isPublic
          : !!editItem.public
      );
      setMemo(editItem.memo || "");
      setStartDate(editItem.startDate || date);
      setEndDate(editItem.endDate || date);
    } else {
      setTitle("");
      setRepeat("한번");
      setIsPublic(false);
      setMemo("");
      setStartDate(date);
      setEndDate(date);
    }
  }, [editItem, date, isEditMode]);

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인 정보가 없습니다.");

      const normalizedStart =
        typeof startDate === "string"
          ? startDate
          : new Date(startDate).toISOString().slice(0, 10);

      const normalizedEnd =
        typeof endDate === "string"
          ? endDate
          : new Date(endDate).toISOString().slice(0, 10);

      // ✅ 컨텍스트의 addTodo 호출 (백엔드까지 연결됨)
      await addTodo({
        title: title.trim(),
        categoryId: categoryInfo?.id, // 필수
        startDate: normalizedStart,
        endDate: normalizedEnd,
        repeat: mapRepeatToServer(repeat),
        isPublic,
        memo: memo.trim(),
      });

      // 구독으로 목록이 자동 갱신되므로 로컬 목록 조작 불필요
      closePopup();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인 정보가 없습니다.");
      if (!editItem?.id) throw new Error("삭제할 항목의 id가 없습니다.");

      // ✅ 컨텍스트의 deleteTodo 사용
      await deleteTodo(editItem.id);

      closePopup();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="A-popup">
      <div className="popup-header">
        <h2>{isEditMode ? "일정 수정" : `${date} 일정 추가`}</h2>
        <button className="close-btn" onClick={closePopup} disabled={submitting}>
          ✕
        </button>
      </div>

      <div className="popup-body">
        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        <div className="form-group">
          <label>반복</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            disabled={submitting}
          >
            <option value="한번">한번</option>
            <option value="매일">매일</option>
            <option value="매주">매주</option>
            <option value="매달">매달</option>
          </select>
        </div>

        {repeat !== "한번" && (
          <div className="form-group">
            <label>기간</label>
            <div className="range-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={submitting}
              />
              <span>~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        <div className="form-group public-row">
          <input
            id="public"
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            disabled={submitting}
          />
          <label htmlFor="public">공개</label>
        </div>

        <div className="form-group">
          <label>할 일 추가</label>
          <input
            type="text"
            placeholder="할 일을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>메모</label>
          <textarea
            placeholder="메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="button-row">
          <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "처리 중…" : isEditMode ? "수정하기" : "등록하기"}
          </button>
          {isEditMode && (
            <button className="delete-btn" onClick={handleDelete} disabled={submitting}>
              {submitting ? "처리 중…" : "삭제하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddDailyItem;
