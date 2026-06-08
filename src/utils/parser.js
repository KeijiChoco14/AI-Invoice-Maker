function cleanPrice(value) {
  return Number(String(value).replace(/[^\d]/g, ""));
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().split("T")[0];
}

function getField(text, labels) {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, "i");
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return "";
}

function parseStructuredItems(text) {
  const lines = text.split("\n");
  const items = [];

  lines.forEach((line) => {
    const cleanLine = line.trim();

    if (!cleanLine.startsWith("-")) return;

    const content = cleanLine.replace("-", "").trim();
    const [description, price] = content.split("|").map((item) => item.trim());

    if (description && price) {
      items.push({
        description,
        quantity: 1,
        unitPrice: cleanPrice(price),
      });
    }
  });

  return items;
}

function parseDueDate(text) {
  const dueText = getField(text, ["Due", "Jatuh Tempo"]);

  if (!dueText) return "";

  const dayMatch = dueText.match(/(\d+)\s*(days?|hari)/i);

  if (dayMatch) {
    return addDays(dayMatch[1]);
  }

  const dateMatch = dueText.match(/\d{4}-\d{2}-\d{2}/);

  return dateMatch ? dateMatch[0] : "";
}

export function parseInvoiceText(text) {
  const structuredItems = parseStructuredItems(text);

  return {
    clientName: getField(text, ["Client", "Klien", "Customer", "Nama Klien"]),
    clientEmail: getField(text, ["Email"]),
    clientPhone: getField(text, ["Phone", "Telepon", "Telp", "WA"]),
    clientAddress: getField(text, ["Address", "Alamat"]),
    dueDate: parseDueDate(text),
    notes: text,
    items:
      structuredItems.length > 0
        ? structuredItems
        : [{ description: "Jasa layanan digital", quantity: 1, unitPrice: 0 }],
  };
}