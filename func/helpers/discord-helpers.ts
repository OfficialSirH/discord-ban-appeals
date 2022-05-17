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
  contentType = "application/json",
  route,
  token = { type: "Bot", value: <string>process.env.DISCORD_TOKEN },
  body,
  querystring = {},
}: {
  method?: "POST" | "GET" | "DELETE";
  contentType?: "application/json" | "application/x-www-form-urlencoded";
  route: ReturnType<typeof Routes[keyof typeof Routes]>;
  token?: { type: "Bearer" | "Bot"; value: string };
  body?: object | string;
  querystring?: Record<string, string>;
}): Promise<RequestResult<Ok>> =>
  (
    await fetch(
      `https://discord.com/api/v10${route}${
        Object.keys(querystring).length > 0
          ? `?${Object.keys(querystring)
              .map((key) => `${key}=${encodeURIComponent(querystring[key])}`)
              .join("&")}`
          : ""
      }`,
      {
        method,
        headers: {
          Authorization: `${token.type} ${token.value}`,
          "Content-Type": contentType,
        },
        body: typeof body == "object" ? JSON.stringify(body) : body,
      }
    )
  )
    .json()
    .then((res) => ({ ok: <Ok>res, err: undefined }))
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((err) => {
      console.log(err);
      return { ok: undefined, err };
    });
