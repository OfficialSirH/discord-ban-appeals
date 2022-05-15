import type { Handler } from "@netlify/functions";

import { decodeJwt } from "./helpers/jwt-helpers";
import { unbanUser } from "./helpers/user-helpers";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
    };
  }

  if (event.queryStringParameters?.token !== undefined) {
    const unbanInfo = decodeJwt(event.queryStringParameters.token);
    if (unbanInfo.userId !== undefined) {
      try {
        await unbanUser(unbanInfo.userId, <string>process.env.GUILD_ID);

        return {
          statusCode: 303,
          headers: {
            Location: `/success?msg=${encodeURIComponent(
              "User has been unbanned\nPlease contact them and let them know"
            )}`,
          },
        };
      } catch (e) {
        return {
          statusCode: 303,
          headers: {
            Location: `/error?msg=${encodeURIComponent(
              "Failed to unban user\nPlease manually unban"
            )}`,
          },
        };
      }
    }
  }

  return {
    statusCode: 400,
  };
};
