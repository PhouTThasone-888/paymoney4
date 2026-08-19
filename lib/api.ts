const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
        ...options?.headers,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
}