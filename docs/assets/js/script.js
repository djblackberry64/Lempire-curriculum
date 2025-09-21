// =======================
// Progress Tracking Script
// =======================

// Speicherort für Userdaten (LocalStorage)
const STORAGE_KEY = "curriculumProgress";

// Fortschritt laden
function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// Fortschritt speichern
function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Lektion als abgeschlossen markieren
function markLessonComplete(url) {
  const progress = loadProgress();
  progress[url] = true;
  saveProgress(progress);
  updateProgressUI();
}

// Fortschritt zurücksetzen
function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  updateProgressUI();
}

// =======================
// Curriculum laden
// =======================
async function loadCurriculum() {
  try {
    const response = await fetch("assets/data/curriculum.json");
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("❌ Konnte curriculum.json nicht laden:", err);
    return {};
  }
}

// =======================
// Progress UI updaten
// =======================
async function updateProgressUI() {
  const curriculum = await loadCurriculum();
  const progress = loadProgress();

  // Beispiel: Gesamtfortschritt berechnen
  let totalLessons = 0;
  let completedLessons = 0;

  Object.values(curriculum).forEach((section) => {
    section.forEach((lesson) => {
      totalLessons++;
      if (progress[lesson.url]) {
        completedLessons++;
      }
    });
  });

  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Fortschrittsbalken (falls vorhanden) aktualisieren
  const bar = document.querySelector(".overall-progress-bar");
  const label = document.querySelector(".overall-progress-label");

  if (bar) {
    bar.style.width = percentage + "%";
  }
  if (label) {
    label.textContent = `${percentage}% abgeschlossen (${completedLessons}/${totalLessons})`;
  }
}

// =======================
// Event Listener für Buttons
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // Button "Lektion abschließen"
  const completeBtn = document.querySelector("#complete-lesson");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      const url = window.location.pathname; // Lektion identifizieren
      markLessonComplete(url);
    });
  }

  // Button "Fortschritt zurücksetzen"
  const resetBtn = document.querySelector("#reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetProgress);
  }

  // Initialen Fortschritt anzeigen
  updateProgressUI();
});
