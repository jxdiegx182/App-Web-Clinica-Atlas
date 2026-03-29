export default function Toast({ toast, onClose }) {
  return (
    <div id="toast" className={toast ? `show ${toast.tone || ""}` : ""} onClick={onClose}>
      {toast?.message || ""}
    </div>
  );
}
