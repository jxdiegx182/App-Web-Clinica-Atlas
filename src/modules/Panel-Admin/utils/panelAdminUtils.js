export const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

export const formatNow = () =>
  new Date().toLocaleString("es-EC", {
    hour12: false,
  });

export const formatClock = () =>
  new Date().toLocaleString("es-EC", {
    hour12: false,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const todayStamp = () => new Date().toISOString().slice(0, 10);

export const downloadFile = (content, filename, type = "text/plain;charset=utf-8;") => {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

export const makeId = (prefix, size = 5) => `${prefix}-${String(Date.now()).slice(-size)}`;

export const matchesSearch = (value, query) =>
  String(value || "")
    .toLowerCase()
    .includes(String(query || "").toLowerCase().trim());

export const buildCsv = (headers, rows) => [headers.join(","), ...rows].join("\n");

export const getBadgeTone = (active) => (active ? "success" : "danger");
