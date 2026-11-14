// Копирование в буфер обмена. Прод открыт по http (http://134.209.53.12): там navigator.clipboard нет —
// браузер даёт его только на https и localhost. Тогда копируем старым способом через скрытое поле.
// within — куда вставить поле: внутри открытого <dialog> всё снаружи неактивно, и выделение там не работает.

export async function copyText(text: string, within?: HTMLElement | null): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // нет прав или фокуса — пробуем старый способ
  }
  const host = within ?? document.body;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.left = "0";
  field.style.opacity = "0";
  host.appendChild(field);
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
