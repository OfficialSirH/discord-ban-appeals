import type { Handler } from "@netlify/functions";
import {
  type RESTPostOAuth2AccessTokenResult,
  Routes,
} from "discord-api-types/v10";

import { getUserInfo } from "./helpers/user-helpers.js";
import { createJwt, type UserDataPayload } from "./helpers/jwt-helpers.js";
import { makeRequest } from "./helpers/discord-helpers.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
    };
  }

  if (event.queryStringParameters?.code === undefined)
    return {
      statusCode: 400,
    };

  const data = {
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code: event.queryStringParameters.code,
    redirect_uri: new URL(event.path, process.env.URL).toString(),
    scope: "identify",
  };

  // convert data to x-www-form-urlencoded string
  const formData = Object.keys(data)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          data[<keyof typeof data>key]
        )}`
    )
    .join("&");

  const result = await makeRequest<RESTPostOAuth2AccessTokenResult>({
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    route: Routes.oauth2TokenExchange(),
    body: formData,
  });

  if (!result.ok) {
    console.log(result.err);
    throw new Error("Failed to get user access token");
  }

  const user = await getUserInfo(result.ok.access_token);

  if (event.queryStringParameters.origin === "/form") {
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

  if (event.queryStringParameters.origin === "/link") {
    const response = await (<Promise<{ message: string }>>(
      await fetch(`${process.env.DISCORD_LINK_API_URL}/userdata`, {
        method: "POST",
        headers: {
          Authorization: process.env.DISCORD_LINK_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          player_id: event.queryStringParameters.playerId,
          player_token: event.queryStringParameters.playerToken,
        }),
      })
    )
      .json()
      .catch((e) => ({ message: e.message })));

    if (!response.message)
      return {
        statusCode: 400,
        headers: {
          Location: "/error?msg=Failed to link account",
        },
      };

    return {
      statusCode: 303,
      headers: {
        Location: "/success?msg=" + encodeURIComponent(response.message),
      },
    };
  }

  return {
    statusCode: 400,
    headers: {
      Location: "/error",
    },
  };
};
