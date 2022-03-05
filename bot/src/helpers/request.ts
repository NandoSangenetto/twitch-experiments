import fetch, { RequestInit } from "node-fetch";

export default async <TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> => {
  const response = await fetch(url, config);
  const data = (await response.json()) as TResponse;
  return data;
};
