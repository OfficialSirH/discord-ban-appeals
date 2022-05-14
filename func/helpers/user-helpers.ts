import type { APIUser, RESTGetAPIGuildBanResult } from "discord-api-types/v10";

import { API_ENDPOINT } from "./discord-helpers.js";

export const getUserInfo = async (token: string) => {
  const result = await fetch(`${API_ENDPOINT}/users/@me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await result.json();

  if (!result.ok) {
    console.log(data);
    throw new Error("Failed to get user information");
  }

  return <APIUser>data;
};

function callBanApi(
  userId: string,
  guildId: string,
  botToken: string,
  method: "GET" | "PUT" | "DELETE"
) {
  return fetch(
    `${API_ENDPOINT}/guilds/${encodeURIComponent(
      guildId
    )}/bans/${encodeURIComponent(userId)}`,
    {
      method,
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );
}

export const getBan = async (
  userId: string,
  guildId: string,
  botToken: string
) => {
  const result = await callBanApi(userId, guildId, botToken, "GET");

  if (result.ok) {
    return <Promise<RESTGetAPIGuildBanResult>>result.json();
  } else if (result.status === 404) {
    return null;
  } else {
    console.log(await result.json());
    throw new Error("Failed to get user ban");
  }
};

export const unbanUser = async (
  userId: string,
  guildId: string,
  botToken: string
) => {
  const result = await callBanApi(userId, guildId, botToken, "DELETE");

  if (!result.ok && result.status !== 404) {
    console.log(await result.json());
    throw new Error("Failed to unban user");
  }
};
