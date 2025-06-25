export function CreateFormData(formData: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value) && value.length && value[0] instanceof File) {
      // Si jamais tu veux gérer plusieurs fichiers sous le même champ
      value.forEach((file: File) => fd.append(key, file));
    } else if (value instanceof Date) {
      fd.append(key, value.toISOString());
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      fd.append(key, value.toString());
    }
  });
  console.log("FormData created:", fd);
  return fd;
}
