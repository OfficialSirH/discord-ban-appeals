import fetch from "node-fetch";
import type { Routes } from "discord-api-types/v10";

type RequestResult<Ok, Err = Error> = {
  ok: Ok | undefined;
  err: Err | undefined;
};

export const MAX_EMBED_FIELD_CHARS = 1024;
export const MAX_EMBED_FOOTER_CHARS = 2048;
export const makeRequest = async <Ok>({
  method = "GET",
  route,
  token = { type: "Bot", value: <string>process.env.DISCORD_TOKEN },
  body,
}: {
  method?: "POST" | "GET" | "DELETE";
  route: ReturnType<typeof Routes[keyof typeof Routes]>;
  token?: { type: "Bearer" | "Bot"; value: string };
  body?: object | string;
}): Promise<RequestResult<Ok>> =>
  (
    await fetch(`https://discord.com/api/v10${route}`, {
      method,
      headers: {
        Authorization: `${token.type} ${token.value}`,
        "Content-Type": "application/json",
      },
      body: typeof body == "object" ? JSON.stringify(body) : body,
    })
  )
    .json()
    .then((res) => ({ ok: <Ok>res, err: undefined }))
    .catch((err) => ({ ok: undefined, err }));
