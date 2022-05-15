import {
  RESTDeleteAPIGuildBanResult,
  RESTGetAPIGuildBanResult,
  RESTGetAPIUserResult,
  Routes,
} from "discord-api-types/v10";
import { restClient } from "./discord-helpers";

export const getUserInfo = async (token: string) => {
  const result = await (<Promise<RESTGetAPIUserResult>>restClient(token).get(
    Routes.user(),
    {
      authPrefix: "Bearer",
    }
  )).catch(() => null);

  if (!result) {
    console.log(result);
    throw new Error("Failed to get user information");
  }

  return result;
};

export const getBan = async (userId: string, guildId: string) => {
  const result = await (<Promise<RESTGetAPIGuildBanResult>>restClient()
    .get(Routes.guildBan(guildId, userId))
    .catch(() => null));

  if (result) return result;

  console.log(result);
  throw new Error("Failed to get user ban");
};

export const unbanUser = async (userId: string, guildId: string) => {
  const result = (await (<Promise<RESTDeleteAPIGuildBanResult>>restClient()
    .delete(Routes.guildBan(guildId, userId))
    .then(() => true)
    .catch(() => false))) as boolean;

  if (!result) {
    console.log(result);
    throw new Error("Failed to unban user");
  }
};
