const STORAGE_KEY = "curriculumProgress";

// ========================
// Load / Save
// ========================
function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ========================
// Mark Lesson Complete
// ========================
function markLessonComplete(url) {
  const progress = loadProgress();
  progress[url] = true;
  saveProgress(progress);
  updateProgressUI();
}

// ========================
// Reset Progress
// ========================
function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  updateProgressUI();
}

// ========================
// Load Curriculum JSON
// ========================
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

// ========================
// Update Progress Bars UI
// ========================
async function updateProgressUI() {
  const curriculum = await loadCurriculum();
  const progress = loadProgress();

  let totalLessons = 0;
  let completedLessons = 0;

  // Clear existing curriculum div
  const curriculumDiv = document.querySelector("#curriculum");
  if (curriculumDiv) curriculumDiv.innerHTML = "";

  for (const [sectionName, lessons] of Object.entries(curriculum)) {
    const sectionEl = document.createElement("div");
    sectionEl.classList.add("section");
    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = sectionName;
    sectionEl.appendChild(sectionTitle);

    const sectionList = document.createElement("ul");
    lessons.forEach((lesson) => {
      totalLessons++;
      const lessonItem = document.createElement("li");
      const lessonLink = document.createElement("a");
      lessonLink.href = lesson.url;
      lessonLink.textContent = lesson.file.replace(".md", "");
      // Mark completed lessons
      if (progress[lesson.url]) lessonLink.classList.add("completed");

      lessonLink.addEventListener("click", (e) => {
        // optional: prevent navigation for demo/testing
        // e.preventDefault();
        markLessonComplete(lesson.url);
      });

      lessonItem.appendChild(lessonLink);
      sectionList.appendChild(lessonItem);

      if (progress[lesson.url]) completedLessons++;
    });

    sectionEl.appendChild(sectionList);
    curriculumDiv.appendChild(sectionEl);
  }

  const overallPercentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Update overall container
  const overallBar = document.querySelector("#overall-bar");
  const overallLabel = document.querySelector("#overall-percentage");
  if (overallBar) overallBar.style.width = overallPercentage + "%";
  if (overallLabel)
    overallLabel.textContent = `${overallPercentage}% (${completedLessons}/${totalLessons})`;
}

// ========================
// Export / Import Progress
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.querySelector("#resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetProgress);

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

  const importBtn = document.querySelector("#import-progress");
  const importFile = document.querySelector("#import-file");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());

    importFile.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProgress = JSON.parse(e.target.result);
          saveProgress(importedProgress);
          updateProgressUI();
          alert("✅ Fortschritt erfolgreich importiert!");
        } catch (err) {
          alert("❌ Fehler beim Import: Ungültige JSON-Datei.");
          console.error(err);
        }
      };
      reader.readAsText(file);
    });
  }

  updateProgressUI();
});
