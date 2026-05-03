// services/api.ts

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

class APIClient {
  private baseURL: string;
  private timeout: number = 10000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<{ data: T }> {
    const url = `${this.baseURL}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body: any) {
    return this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  put<T>(path: string, body: any) {
    return this.request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

const api = new APIClient(baseURL);
export default api;
