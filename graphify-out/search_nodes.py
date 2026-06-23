import json
import sys

# Set stdout to use utf-8
sys.stdout.reconfigure(encoding='utf-8')

g = json.load(open('graphify-out/graph.json', encoding='utf-8'))
nodes = g.get('nodes', [])
matches = [n for n in nodes if any(x in n.get('label', '').lower() or x in n.get('id', '').lower() for x in ['approval', 'request', 'mine'])]
print(f"Found {len(matches)} matching nodes:")
for m in matches:
    print(f"ID: {m.get('id')} | Label: {m.get('label')} | Type: {m.get('file_type')} | File: {m.get('source_file')}")
