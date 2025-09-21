const STORAGE_KEY = "curriculumProgress";

// Load / Save
function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function markLessonComplete(url) {
  const progress = loadProgress();
  progress[url] = true;
  saveProgress(progress);
  updateProgressUI();
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  updateProgressUI();
}

// Load Curriculum
async function loadCurriculum() {
  try {
    const response = await fetch("assets/data/curriculum.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("❌ Konnte curriculum.json nicht laden:", err);
    return {};
  }
}

// Update Progress UI
async function updateProgressUI() {
  const curriculum = await loadCurriculum();
  const progress = loadProgress();

  let totalLessons = 0;
  let completedLessons = 0;

  Object.values(curriculum).forEach((section) => {
    section.forEach((lesson) => {
      totalLessons++;
      if (progress[lesson.url]) completedLessons++;
    });
  });

  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const bar = document.querySelector(".overall-progress-bar");
  const label = document.querySelector(".overall-progress-label");

  if (bar) bar.style.width = percentage + "%";
  if (label)
    label.textContent = `${percentage}% abgeschlossen (${completedLessons}/${totalLessons})`;
}

document.addEventListener("DOMContentLoaded", () => {
  const completeBtn = document.querySelector("#complete-lesson");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      const url = window.location.pathname;
      markLessonComplete(url);
    });
  }

  const resetBtn = document.querySelector("#reset-progress");
  if (resetBtn) resetBtn.addEventListener("click", resetProgress);

  updateProgressUI();
});
// Exportieren
const exportBtn = document.querySelector("#export-progress");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const progress = loadProgress();
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curriculum-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Importieren
const importBtn = document.querySelector("#import-progress");
const importFile = document.querySelector("#import-file");

if (importBtn && importFile) {
  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedProgress = JSON.parse(e.target.result);
        saveProgress(importedProgress);
        updateProgressUI();
        alert("Fortschritt erfolgreich importiert!");
      } catch (err) {
        alert("Fehler beim Import: Ungültige JSON-Datei.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  });
}
