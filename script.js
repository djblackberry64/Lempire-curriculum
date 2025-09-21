let progress = JSON.parse(localStorage.getItem("progress")) || {};
let curriculumData = {};

async function loadCurriculum() {
  const res = await fetch("/curriculum.json");
  curriculumData = await res.json();
  renderCurriculum();
  updateOverallProgress();
}

function renderCurriculum() {
  const container = document.getElementById("curriculum");
  container.innerHTML = "";

  Object.keys(curriculumData).forEach((sectionKey) => {
    const section = curriculumData[sectionKey];

    // Section Div
    const secDiv = document.createElement("div");
    secDiv.className = "section";

    // Section Header
    const secHeader = document.createElement("div");
    secHeader.className = "section-title";
    secHeader.textContent = sectionKey;

    // Section Progress Bar
    const secBarContainer = document.createElement("div");
    secBarContainer.className = "progress-bar";
    const secBar = document.createElement("div");
    secBar.id = `section-bar-${sectionKey}`;
    secBar.style.width = getSectionProgress(section) + "%";
    secBarContainer.appendChild(secBar);

    // Lessons Container
    const lessonsDiv = document.createElement("div");
    lessonsDiv.className = "lessons hidden";

    section.forEach((lesson) => {
      const lDiv = document.createElement("div");
      lDiv.className = "lesson";

      // Lesson Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = progress[lesson.url] || false;
      checkbox.onchange = () => {
        progress[lesson.url] = checkbox.checked;
        saveProgress();
        renderCurriculum();
      };

      const label = document.createElement("span");
      label.textContent = lesson.file.replace(".md", "");

      // Kapitel-Fortschritt Bar
      const chapterBarContainer = document.createElement("div");
      chapterBarContainer.className = "progress-bar lesson-chapter-bar";
      const chapterBar = document.createElement("div");
      chapterBar.style.width = getLessonChapterProgress(lesson) + "%";
      chapterBarContainer.appendChild(chapterBar);

      lDiv.appendChild(checkbox);
      lDiv.appendChild(label);
      lDiv.appendChild(chapterBarContainer);

      lessonsDiv.appendChild(lDiv);
    });

    secHeader.onclick = () => lessonsDiv.classList.toggle("hidden");

    secDiv.appendChild(secHeader);
    secDiv.appendChild(secBarContainer);
    secDiv.appendChild(lessonsDiv);
    container.appendChild(secDiv);
  });
}

function getSectionProgress(section) {
  const total = section.length;
  const done = section.filter((l) => progress[l.url]).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function getLessonChapterProgress(lesson) {
  const total = lesson.totalChapters || 1;
  const done = progress[lesson.url + "_chapters"] || 0;
  return total ? Math.round((done / total) * 100) : 0;
}

function updateOverallProgress() {
  const allLessons = Object.values(curriculumData).flat();
  const total = allLessons.length;
  const done = allLessons.filter((l) => progress[l.url]).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("overall-percentage").textContent = percent + "%";
  document.getElementById("overall-bar").style.width = percent + "%";

  // Section Bars
  Object.keys(curriculumData).forEach((sectionKey) => {
    const section = curriculumData[sectionKey];
    const secPercent = Math.round(
      (section.filter((l) => progress[l.url]).length / section.length) * 100
    );
    const secBar = document.querySelector(`#section-bar-${sectionKey}`);
    if (secBar) secBar.style.width = secPercent + "%";
  });
}

function saveProgress() {
  localStorage.setItem("progress", JSON.stringify(progress));
  updateOverallProgress();
}

// Export / Import / Reset
document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(progress)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "progress.json";
  a.click();
};

document.getElementById("importBtn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      progress = JSON.parse(reader.result);
      saveProgress();
      renderCurriculum();
    };
    reader.readAsText(file);
  };
  input.click();
};

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Fortschritt wirklich zurücksetzen?")) {
    progress = {};
    saveProgress();
    renderCurriculum();
  }
};

loadCurriculum();
