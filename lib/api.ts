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

const GET = (model: string, params?: any): Promise<Response> => {
  let paramsString = "";

  if (params) {
    const p = new URLSearchParams(params);
    paramsString = Object.values(params).length ? `?${p.toString()}` : "";
  }

  return fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/${model}${paramsString}`,
    {
      method: "GET",
    }
  );
};

const api = {
  POST,
  GET,
};

export default api;
