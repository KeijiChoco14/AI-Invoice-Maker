function cleanPrice(value) {
  return Number(String(value).replace(/[^\d]/g, ""));
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().split("T")[0];
}

function removeContactSections(text) {
  return text
    .replace(/email\s*[:\-]?\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/(?:telepon|telp|phone|wa)\s*[:\-]?\s*[\d+\-\s]+/gi, "")
    .replace(/(?:jatuh tempo|due in|due)\s*\d+\s*(?:hari|days?)/gi, "");
}

export function parseInvoiceText(text) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  const phoneMatch = text.match(
    /(?:telepon|telp|phone|wa)\s*[:\-]?\s*([\d+\-\s]+)/i
  );

  const clientMatch =
    text.match(/(?:untuk|kepada|for|client|klien|customer)\s+([^,]+)/i);

  const addressMatch =
    text.match(
      /alamat\s*[:\-]?\s*(.*?)(?=email|telepon|telp|phone|wa|jasa|service|jatuh tempo|due|$)/i
    ) ||
    text.match(/address\s*[:\-]?\s*(.*?)(?=email|phone|service|due|$)/i);

  const dueMatch = text.match(
    /(?:jatuh tempo|due in|due)\s*(\d+)\s*(?:hari|days?)/i
  );

  const dueDate = dueMatch ? addDays(dueMatch[1]) : "";

  const itemSource = removeContactSections(text);

  const itemPattern =
    /(?:jasa|layanan|service)?\s*([^,.]+?)\s+(?:rp|idr)\s*([\d.]{4,})(?=,|\.| dan | and |$)/gi;

  const items = [];
  let match;

  while ((match = itemPattern.exec(itemSource)) !== null) {
    let description = match[1]
      .replace(/buat invoice untuk/gi, "")
      .replace(/create invoice for/gi, "")
      .replace(clientMatch?.[1] || "", "")
      .replace(/alamat\s*[:\-]?/gi, "")
      .replace(addressMatch?.[1] || "", "")
      .replace(/^(dan|and)\s+/i, "")
      .trim();

    const unitPrice = cleanPrice(match[2]);

    if (description && unitPrice > 0) {
      items.push({
        description,
        quantity: 1,
        unitPrice,
      });
    }
  }

  return {
    clientName: clientMatch ? clientMatch[1].trim() : "",
    clientEmail: emailMatch ? emailMatch[0] : "",
    clientPhone: phoneMatch ? phoneMatch[1].trim() : "",
    clientAddress: addressMatch ? addressMatch[1].trim().replace(/,$/, "") : "",
    dueDate,
    notes: text,
    items:
      items.length > 0
        ? items
        : [{ description: "Jasa layanan digital", quantity: 1, unitPrice: 0 }],
  };
}