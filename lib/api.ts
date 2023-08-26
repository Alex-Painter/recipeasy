const POST = (model: string, body: any): Promise<Response> => {
  return fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/${model}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

const GET = (model: string): Promise<Response> => {
  return fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/${model}`, {
    method: "GET",
  });
};

const api = {
  POST,
  GET,
};

export default api;
