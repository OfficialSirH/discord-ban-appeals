import {
  type RESTDeleteAPIGuildBanResult,
  type RESTGetAPIGuildBanResult,
  type RESTGetAPIUserResult,
  Routes,
} from "discord-api-types/v10";
import { makeRequest } from "./discord-helpers";

export const getUserInfo = async (token: string) => {
  const result = await makeRequest<RESTGetAPIUserResult>({
    route: Routes.user(),
    token: { type: "Bearer", value: token },
  });

  if (!result.ok) {
    console.log(result.err);
    throw new Error("Failed to get user information");
  }

  return result.ok;
};

export const getBan = async (userId: string, guildId: string) => {
  const result = await makeRequest<RESTGetAPIGuildBanResult>({
    route: Routes.guildBan(guildId, userId),
  });

  if (result.ok) return result.ok;

  console.log(result.err);
  throw new Error("Failed to get user ban");
};

export const unbanUser = async (userId: string, guildId: string) => {
  const result = await makeRequest<RESTDeleteAPIGuildBanResult>({
    method: "DELETE",
    route: Routes.guildBan(guildId, userId),
  });

  if (!result.ok) {
    console.log(result.err);
    throw new Error("Failed to unban user");
  }
};
