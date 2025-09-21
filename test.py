import re

with open("docs/foundations/intro.md", "r", encoding="utf-8") as f:
    content = f.read()

print("RAW CONTENT:")
print(repr(content))

# Zeilenenden normalisieren
content = content.replace("\r\n","\n").replace("\r","\n")

# Regex für ## und ###
heading_pattern = re.compile(r"^\s*#{2,3}\s+(.*)", re.MULTILINE)
headings = heading_pattern.findall(content)

print("HEADINGS FOUND:", headings)
print("TOTAL:", len(headings))
