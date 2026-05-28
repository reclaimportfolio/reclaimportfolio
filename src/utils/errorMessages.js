export function normalizeApiError(error) {
  if (!error) return { message: "Something went wrong.", fields: {} };
  const data = error.data;
  const fields = error.fields || {};
  if (error.message) return { message: error.message, fields, data };
  if (typeof data === "string") return { message: data, fields, data };
  if (data?.detail) return { message: Array.isArray(data.detail) ? data.detail.join(" ") : String(data.detail), fields, data };
  if (data?.non_field_errors) {
    return { message: Array.isArray(data.non_field_errors) ? data.non_field_errors.join(" ") : String(data.non_field_errors), fields, data };
  }
  const first = data && Object.values(data)[0];
  if (Array.isArray(first)) return { message: first.join(" "), fields, data };
  return { message: "Something went wrong.", fields, data };
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return normalizeApiError(error).message || fallback;
}

export function getFieldErrors(error) {
  return normalizeApiError(error).fields || {};
}
