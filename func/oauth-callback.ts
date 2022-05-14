import type { Handler } from "@netlify/functions";
import { fetch } from "undici";

import { getUserInfo, getBan } from "./helpers/user-helpers.js";
import { createJwt, UserDataPayload } from "./helpers/jwt-helpers.js";
import type { RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult } from "discord-api-types/v10.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
    };
  }

  if (event.queryStringParameters?.code !== undefined) {
    const result = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: <string>process.env.DISCORD_CLIENT_ID,
        client_secret: <string>process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: event.queryStringParameters.code,
        redirect_uri: new URL(event.path, process.env.URL).toString(),
        scope: "identify",
      }),
    });

    const data = await (<
      Promise<RESTPostOAuth2AccessTokenWithBotAndGuildsScopeResult>
    >result.json());

    if (!result.ok) {
      console.log(data);
      throw new Error("Failed to get user access token");
    }

    const user = await getUserInfo(data.access_token);

    const userPublic = <UserDataPayload>{
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      discriminator: user.discriminator,
      email: user.email,
    };
    let url = `/form?token=${encodeURIComponent(
      createJwt(userPublic, data.expires_in)
    )}`;
    if (event.queryStringParameters.state !== undefined) {
      url += `&state=${encodeURIComponent(event.queryStringParameters.state)}`;
    }

    return {
      statusCode: 303,
      headers: {
        Location: url,
      },
    };
  }

  return {
    statusCode: 400,
  };
};
