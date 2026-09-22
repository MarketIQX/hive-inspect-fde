#!/usr/bin/env python3
import argparse
import hashlib
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def cell_value(cell, shared):
    cell_type = cell.attrib.get("t")
    if cell_type == "s":
        node = cell.find("m:v", NS)
        return shared[int(node.text)] if node is not None and node.text else ""
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//m:t", NS))
    node = cell.find("m:v", NS)
    return (node.text or "") if node is not None else ""


class RichHTMLInventory(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = Counter()
        self.attrs = Counter()
    def handle_starttag(self, tag, attrs):
        self.tags[tag] += 1
        for key, _ in attrs:
            self.attrs[key] += 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    args = parser.parse_args()

    raw = open(args.path, "rb").read()
    print("# Export A Physical Inventory")
    print()
    print(f"- Path: `{args.path}`")
    print(f"- Size: {len(raw)} bytes")
    print(f"- SHA-256: `{hashlib.sha256(raw).hexdigest().upper()}`")
    print(f"- First 16 bytes: `{' '.join(f'{b:02X}' for b in raw[:16])}`")
    print(f"- ZIP container: {zipfile.is_zipfile(args.path)}")
    print()

    if not zipfile.is_zipfile(args.path):
        raise SystemExit("Not a ZIP-based package; stop rather than infer workbook structure.")

    with zipfile.ZipFile(args.path) as archive:
        names = archive.namelist()
        print("## Package entries")
        for name in names:
            print(f"- `{name}`")
        print()

        shared = []
        if "xl/sharedStrings.xml" in names:
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for si in shared_root.findall("m:si", NS):
                shared.append("".join(n.text or "" for n in si.findall(".//m:t", NS)))
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_map = {r.attrib["Id"]: r.attrib["Target"] for r in rels.findall("r:Relationship", REL_NS)}

        print("## Worksheets")
        sheets = workbook.find("m:sheets", NS)
        for sheet in sheets:
            target = rel_map[sheet.attrib[RID]]
            xml_path = "xl/" + target.lstrip("/")
            root = ET.fromstring(archive.read(xml_path))
            rows = root.findall(".//m:sheetData/m:row", NS)
            cells = root.findall(".//m:sheetData/m:row/m:c", NS)
            populated = [c for c in cells if cell_value(c, shared) != ""]
            dimension = root.find("m:dimension", NS)
            hidden_rows = [r.attrib.get("r") for r in rows if r.attrib.get("hidden") == "1"]
            hidden_cols = [c.attrib for c in root.findall(".//m:cols/m:col", NS) if c.attrib.get("hidden") == "1"]
            merges = [m.attrib.get("ref") for m in root.findall(".//m:mergeCells/m:mergeCell", NS)]
            formulas = [c.attrib.get("r") for c in cells if c.find("m:f", NS) is not None]
            hyperlinks = [h.attrib for h in root.findall(".//m:hyperlinks/m:hyperlink", NS)]
            validations = root.findall(".//m:dataValidations/m:dataValidation", NS)

            print(f"### {sheet.attrib['name']}")
            print(f"- State: {sheet.attrib.get('state', 'visible')}")
            print(f"- Dimension: {dimension.attrib.get('ref') if dimension is not None else '(none)'}")
            print(f"- Serialized rows: {len(rows)}")
            print(f"- Serialized cells: {len(cells)}")
            print(f"- Populated cells: {len(populated)}")
            print(f"- Cell types: {dict(Counter(c.attrib.get('t', 'n') for c in cells))}")
            print(f"- Hidden rows: {len(hidden_rows)}")
            print(f"- Hidden columns: {len(hidden_cols)}")
            print(f"- Merged regions: {len(merges)}")
            print(f"- Formula cells: {len(formulas)}")
            print(f"- Worksheet hyperlinks: {len(hyperlinks)}")
            print(f"- Data validations: {len(validations)}")
            print()
            if rows:
                headers = {}
                first = rows[0]
                for cell in first.findall("m:c", NS):
                    match = re.match(r"[A-Z]+", cell.attrib["r"])
                    headers[match.group()] = cell_value(cell, shared)

                print("#### Column inventory")
                print("| Column | Header | Populated data cells | HTML-like values |")
                print("| --- | --- | ---: | ---: |")
                rich = RichHTMLInventory()
                for col in sorted(headers, key=lambda x: (len(x), x)):
                    values = []
                    for row in rows[1:]:
                        for cell in row.findall("m:c", NS):
                            if re.match(r"[A-Z]+", cell.attrib["r"]).group() == col:
                                values.append(cell_value(cell, shared))
                    nonempty = [v for v in values if v != ""]
                    html_like = [v for v in nonempty if re.search(r"<[A-Za-z][^>]*>", v)]
                    for value in html_like:
                        try:
                            rich.feed(value)
                        except Exception:
                            pass
                    safe_header = headers[col].replace("|", "\\|")
                    print(f"| {col} | {safe_header} | {len(nonempty)} | {len(html_like)} |")
                print()
                print("#### Rich HTML-like content inventory")
                print(f"- Tags: {dict(rich.tags)}")
                print(f"- Attributes: {dict(rich.attrs)}")
                print()

        print("## Interpretation boundary")
        print("This report inventories physical package and worksheet structures.")
        print("It does not infer destination schema, semantic hierarchy, or importer behavior.")


if __name__ == "__main__":
    main()
