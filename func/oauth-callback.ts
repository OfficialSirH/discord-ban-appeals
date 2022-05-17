import type { Handler } from "@netlify/functions";
import {
  type RESTPostOAuth2AccessTokenResult,
  Routes,
} from "discord-api-types/v10";

import { getUserInfo } from "./helpers/user-helpers.js";
import { createJwt, UserDataPayload } from "./helpers/jwt-helpers.js";
import { makeRequest } from "./helpers/discord-helpers.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
    };
  }

  if (event.queryStringParameters?.code !== undefined) {
    const result = await makeRequest<RESTPostOAuth2AccessTokenResult>({
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      route: Routes.oauth2TokenExchange(),
      querystring: {
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: event.queryStringParameters.code,
        redirect_uri: new URL(event.path, process.env.URL).toString(),
        scope: "identify",
      },
    });

    if (!result.ok) {
      console.log(result.err);
      throw new Error("Failed to get user access token");
    }

    const user = await getUserInfo(result.ok.access_token);

    const userPublic = <UserDataPayload>{
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      discriminator: user.discriminator,
      email: user.email,
    };
    let url = `/form?token=${encodeURIComponent(
      createJwt(userPublic, result.ok.expires_in)
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
