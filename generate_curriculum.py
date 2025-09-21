import os, re, json

import os
import re
import json

# Ordner, in dem alle Markdown-Lektionen liegen
DOCS_DIR = "docs"

# Regex für ## oder ###
heading_pattern = re.compile(r"^\s*#{2,3}\s+(.*)", re.MULTILINE)

# Dictionary für Curriculum
curriculum = {}

for section in os.listdir(DOCS_DIR):
    section_path = os.path.join(DOCS_DIR, section)
    if os.path.isdir(section_path):
        lessons = []
        for file in os.listdir(section_path):
            if file.endswith(".md"):
                file_path = os.path.join(section_path, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Zeilenenden normalisieren
                content = content.replace("\r\n", "\n").replace("\r", "\n")
                # Unsichtbare Zero-Width-Zeichen entfernen
                content = re.sub(r'[\u200B]', '', content)

                headings = heading_pattern.findall(content)
                total_chapters = len(headings)
                url = f"/{section}/{file.replace('.md','')}/"
                lessons.append({
                    "url": url,
                    "file": file,
                    "totalChapters": total_chapters
                })
        curriculum[section.capitalize()] = lessons

# JSON-Datei erzeugen
with open("curriculum.json", "w", encoding="utf-8") as f:
    json.dump(curriculum, f, indent=2, ensure_ascii=False)

print("✅ Curriculum JSON erstellt!")
