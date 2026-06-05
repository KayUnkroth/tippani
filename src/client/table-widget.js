// GFM table block widget (#45). Replaces a pipe-table's source with a rendered
// grid. Block decorations span line breaks, so they must come from a StateField
// (a ViewPlugin may not emit them).
//
// Slice 1: read-only render. When the selection is inside the table, the widget
// steps aside so the raw pipe source is editable (a fallback until the grid itself
// becomes editable in slice 2). The document is never mutated here — the widget is
// pure display, so unedited tables round-trip byte-identical.

import { WidgetType, Decoration, EditorView } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { parseTable } from "./table.js";

const ALIGN_CSS = { left: "left", center: "center", right: "right", none: "left" };

class TableWidget extends WidgetType {
  constructor(src, model) {
    super();
    this.src = src;
    this.model = model;
  }
  // Reuse DOM while the source text is unchanged.
  eq(other) {
    return other.src === this.src;
  }
  toDOM() {
    const { aligns, header, rows } = this.model;
    const table = document.createElement("table");
    table.className = "cm-pv-table";

    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    header.forEach((cell, c) => {
      const th = document.createElement("th");
      th.textContent = cell;
      th.style.textAlign = ALIGN_CSS[aligns[c]] || "left";
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell, c) => {
        const td = document.createElement("td");
        td.textContent = cell;
        td.style.textAlign = ALIGN_CSS[aligns[c]] || "left";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }
  ignoreEvent() {
    return false; // read-only: let CM handle clicks (places cursor adjacent)
  }
}

function selectionInside(state, from, to) {
  for (const r of state.selection.ranges) {
    if (r.from <= to && r.to >= from) return true;
  }
  return false;
}

function buildTableDecorations(state) {
  const deco = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== "Table") return;
      if (selectionInside(state, node.from, node.to)) return; // reveal raw source
      const src = state.doc.sliceString(node.from, node.to);
      const model = parseTable(src);
      if (!model) return; // not a well-formed table — leave raw
      deco.push(
        Decoration.replace({
          block: true,
          widget: new TableWidget(src, model),
        }).range(node.from, node.to)
      );
    },
  });
  return Decoration.set(deco, true);
}

export const tableField = StateField.define({
  create: (state) => buildTableDecorations(state),
  update(value, tr) {
    if (tr.docChanged || tr.selection) return buildTableDecorations(tr.state);
    return value.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});
