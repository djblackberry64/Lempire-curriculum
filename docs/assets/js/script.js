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
