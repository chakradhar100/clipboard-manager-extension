// Configuration: maximum clipboard entries
const MAX_HISTORY = 10;

// Load history from storage
async function loadHistory() {
  const data = await browser.storage.local.get("clipboardHistory");
  return data.clipboardHistory || [];
}

// Save history to storage
async function saveHistory(history) {
  await browser.storage.local.set({ clipboardHistory: history });
}

// Add new clipboard entry and update history
async function addClipboardEntry(entry) {
  let history = await loadHistory();
  history.unshift(entry); // Add new entry at the beginning
  history = history.slice(0, MAX_HISTORY); // Keep only the last MAX_HISTORY entries
  await saveHistory(history);
  updateHistoryUI();
}

// Update the UI with clipboard history
async function updateHistoryUI() {
  const container = document.getElementById("history-container");
  const history = await loadHistory();

  container.innerHTML = ""; // Clear existing content
  if (history.length === 0) {
    container.innerHTML = "<p>No clipboard history yet.</p>";
    return;
  }

  history.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("history-item");
    div.textContent = item;

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => navigator.clipboard.writeText(item);

    div.appendChild(copyBtn);
    container.appendChild(div);
  });
}

// Capture clipboard content
async function captureClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      const history = await loadHistory();
      if (history[0] !== text) { // Avoid duplicates
        await addClipboardEntry(text);
        alert("Clipboard captured: " + text);
      }
    }
  } catch (error) {
    console.error("Failed to read clipboard:", error);
  }
}

// Clear clipboard history
async function clearHistory() {
  await browser.storage.local.set({ clipboardHistory: [] });
  updateHistoryUI();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateHistoryUI();
  document.getElementById("capture-clipboard").addEventListener("click", captureClipboard);
  document.getElementById("clear-history").addEventListener("click", clearHistory);
});
