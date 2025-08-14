// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/scss/Signup.scss"; // 필요 시 경로 맞춰줘

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    id: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [isValid, setIsValid] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const { email, id, password, confirmPassword, agree } = form;
    setIsValid(
      email.trim() &&
        id.trim() &&
        password.trim() &&
        confirmPassword.trim() &&
        password === confirmPassword &&
        agree
    );
  }, [form]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setMsg("가입 중…");

    try {
      const res = await fetch(
        "https://us-central1-dooop-69a1b.cloudfunctions.net/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            id: form.id,
          }),
        }
      );

      // 응답 본문이 JSON이 아닐 수도 있으니 방어
      let data = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // pass
      }

      if (!res.ok) {
        const errMsg = (data && (data.error || data.message)) || text || "서버 오류";
        throw new Error(errMsg);
      }

      setMsg("✅ 회원가입 성공!");
      // 필요하면 바로 로그인 or 다음 페이지 이동
      navigate("/", { replace: true });;
    } catch (err) {
      setMsg(`❌ 오류: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="signup-page">
      <h2 className="signup-title">회원가입</h2>

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>이메일 <span className="required">*</span></label>
          <input type="email" name="email" value={form.email} onChange={onChange} />
        </div>

        <div className="form-group">
          <label>아이디 <span className="required">*</span></label>
          <input type="text" name="id" value={form.id} onChange={onChange} />
        </div>

        <div className="form-group">
          <label>비밀번호 <span className="required">*</span></label>
          <input type="password" name="password" value={form.password} onChange={onChange} />
          <small>8~16자</small>
        </div>

        <div className="form-group">
          <label>비밀번호 확인 <span className="required">*</span></label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} />
        </div>

        <div className="checkbox-wrapper">
          <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
          <span>개인정보 수집 및 이용에 동의합니다.</span>
        </div>

        <button className={`submit-button ${isValid ? "active" : ""}`} disabled={!isValid} type="submit">
          완료
        </button>
      </form>

      {msg && <p className="signup-msg">{msg}</p>}
    </div>
  );
}
