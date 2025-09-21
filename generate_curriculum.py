import os, re, json

DOCS_DIR = "docs"
curriculum = {}
heading_pattern = re.compile(r"^#{2,3}\s+.+", re.MULTILINE)

for section in os.listdir(DOCS_DIR):
    section_path = os.path.join(DOCS_DIR, section)
    if os.path.isdir(section_path):
        lessons = []
        for file in os.listdir(section_path):
            if file.endswith(".md"):
                file_path = os.path.join(section_path, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                headings = heading_pattern.findall(content)
                total_chapters = len(headings)
                url = f"/{section}/{file.replace('.md','')}/"
                lessons.append({"url": url, "file": file, "totalChapters": total_chapters})
        curriculum[section.capitalize()] = lessons

with open("curriculum.json", "w", encoding="utf-8") as f:
    json.dump(curriculum, f, indent=2, ensure_ascii=False)
print("✅ Curriculum updated!")
