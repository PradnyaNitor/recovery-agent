const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  async get(path: string) {
    const res = await fetch(`${BASE_URL}${path}`);
    return res.json();
  },

  async post(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }
};