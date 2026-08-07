const statusEl = document.getElementById("status");
const reasonsEl = document.getElementById("reasons");

chrome.runtime.sendMessage({ type: "GET_ACTIVE_SCORE" }, (result) => {
  if (!result) {
    statusEl.textContent = "No data for this page yet.";
    statusEl.classList.add("low");
    return;
  }

  const { score, reasons } = result;
  let level = "low";
  let label = `Low risk (${score}/100)`;

  if (score >= 70) {
    level = "high";
    label = `High risk (${score}/100)`;
  } else if (score >= 30) {
    level = "medium";
    label = `Caution (${score}/100)`;
  }

  statusEl.textContent = label;
  statusEl.classList.add(level);

  if (reasons.length > 0) {
    const ul = document.createElement("ul");
    for (const r of reasons) {
      const li = document.createElement("li");
      li.textContent = r;
      ul.appendChild(li);
    }
    reasonsEl.appendChild(ul);
  }
});
