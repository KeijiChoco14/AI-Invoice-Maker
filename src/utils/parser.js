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

function parseDueDate(text) {
  const structuredDue = getField(text, ["Due", "Jatuh Tempo", "Deadline"]);

  const source = structuredDue || text;

  const dayMatch = source.match(
    /(?:due|jatuh tempo|deadline)?\s*(?:in)?\s*(\d+)\s*(days?|hari)/i,
  );

  if (dayMatch) {
    return addDays(dayMatch[1]);
  }

  const dateMatch = source.match(/\d{4}-\d{2}-\d{2}/);

  return dateMatch ? dateMatch[0] : "";
}

function parseStructuredItems(text) {
  const lines = text.split("\n");
  const items = [];

  lines.forEach((line) => {
    const cleanLine = line.trim();

    if (!cleanLine.startsWith("-")) return;

    const content = cleanLine.replace(/^-\s*/, "").trim();
    const [description, price, quantity] = content
      .split("|")
      .map((item) => item.trim());

    if (description && price) {
      items.push({
        description,
        quantity: quantity ? Number(quantity) || 1 : 1,
        unitPrice: cleanPrice(price),
      });
    }
  });

  return items.filter((item) => item.description && item.unitPrice > 0);
}

function removeNonItemSections(text) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/email\s*[:-]?\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/(?:telepon|telp|phone|wa)\s*[:-]?\s*[\d+\s-]+/gi, "")
    .replace(
      /(?:jatuh tempo|due|deadline)\s*(?:in)?\s*\d+\s*(?:hari|days?)/gi,
      "",
    )
    .replace(
      /(?:client|klien|customer|untuk|kepada|for)\s*[:-]?\s*[^,.\n]+/gi,
      "",
    )
    .replace(
      /(?:address|alamat)\s*[:-]?\s*.*?(?=email|telepon|telp|phone|wa|jasa|service|layanan|due|jatuh tempo|deadline|$)/gi,
      "",
    );
}

function parseFreeTextItems(text) {
  const cleanedText = removeNonItemSections(text);

  const itemPattern =
    /(?:jasa|layanan|service)?\s*([^,.|\n]+?)\s+(?:rp|idr)\s*([\d.]+)/gi;

  const items = [];
  let match;

  while ((match = itemPattern.exec(cleanedText)) !== null) {
    let description = match[1]
      .replace(/^(dan|and|serta)\s+/i, "")
      .replace(/\b(jasa|layanan|service)\b/gi, "")
      .trim();

    description = description.replace(/\s+/g, " ");

    const unitPrice = cleanPrice(match[2]);

    if (
      description &&
      unitPrice > 0 &&
      !description.match(/^(email|telepon|telp|phone|wa|alamat|address)$/i)
    ) {
      items.push({
        description,
        quantity: 1,
        unitPrice,
      });
    }
  }

  return items;
}

function parseClientName(text) {
  const structuredClient = getField(text, [
    "Client",
    "Klien",
    "Customer",
    "Nama Klien",
  ]);

  if (structuredClient) return structuredClient;

  const match = text.match(
    /(?:untuk|kepada|for|client|klien|customer)\s+([^,.\n]+)/i,
  );

  return match ? match[1].trim() : "";
}

function parseClientAddress(text) {
  const structuredAddress = getField(text, ["Address", "Alamat"]);

  if (structuredAddress) return structuredAddress;

  const match = text.match(
    /(?:alamat|address)\s*[:-]?\s*(.*?)(?=email|telepon|telp|phone|wa|jasa|service|layanan|jatuh tempo|due|deadline|$)/i,
  );

  return match ? match[1].trim().replace(/,$/, "") : "";
}

function parseStatus(text) {
  const lower = text.toLowerCase();

  if (lower.includes("paid") || lower.includes("lunas")) return "Paid";
  if (lower.includes("overdue") || lower.includes("terlambat"))
    return "Overdue";
  if (lower.includes("draft")) return "Draft";
  if (lower.includes("unpaid") || lower.includes("belum dibayar"))
    return "Unpaid";

  return "";
}

export function parseInvoiceText(text) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  const phoneMatch =
    text.match(/(?:telepon|telp|phone|wa)\s*[:-]?\s*([\d+\s-]+)/i) ||
    text.match(/(?:\+62|08)\d[\d\s-]{7,}/);

  const structuredItems = parseStructuredItems(text);
  const freeTextItems = parseFreeTextItems(text);

  const items = structuredItems.length > 0 ? structuredItems : freeTextItems;

  return {
    clientName: parseClientName(text),
    clientEmail: emailMatch ? emailMatch[0] : "",
    clientPhone: phoneMatch
      ? String(phoneMatch[1] || phoneMatch[0]).trim()
      : "",
    clientAddress: parseClientAddress(text),
    dueDate: parseDueDate(text),
    status: parseStatus(text),
    notes: text,
    items:
      items.length > 0
        ? items
        : [{ description: "Jasa layanan digital", quantity: 1, unitPrice: 0 }],
  };
}
