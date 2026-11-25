export function parseQrExpenseData(rawData) {
  const text = String(rawData ?? '').trim();
  if (!text) {
    return { title: '', amount: '', category: '', notes: '' };
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const rawAmount = parsed.amount ?? parsed.monto ?? parsed.total ?? '';
      const numericAmount = Number(String(rawAmount).replace(',', '.'));
      const validAmount =
        rawAmount !== '' && Number.isFinite(numericAmount) && numericAmount > 0
          ? String(numericAmount)
          : '';

      return {
        title: String(parsed.title ?? parsed.titulo ?? parsed.comercio ?? '').trim(),
        amount: validAmount,
        category: String(parsed.category ?? parsed.categoria ?? '').trim(),
        notes: String(parsed.notes ?? parsed.notas ?? parsed.detalle ?? '').trim(),
      };
    }
  } catch {
    // Si no es JSON válido, se trata como texto plano o URL
  }

  const isUrl = /^https?:\/\//i.test(text);
  return {
    title: isUrl ? '' : text.slice(0, 60),
    amount: '',
    category: '',
    notes: isUrl ? `QR: ${text}` : text,
  };
}