import type { Handler } from "@netlify/functions";
import {
  type RESTPostAPIChannelMessageJSONBody,
  Routes,
  type RESTPostAPIChannelMessageResult,
} from "discord-api-types/v10";

import {
  makeRequest,
  MAX_EMBED_FOOTER_CHARS,
} from "./helpers/discord-helpers.js";
import { decodeJwt } from "./helpers/jwt-helpers.js";
import { getBan } from "./helpers/user-helpers.js";

export const handler: Handler = async (event) => {
  let payload;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
    };
  }

  const params = new URLSearchParams(event.body!);
  payload = {
    caseid: params.get("caseid") || undefined,
    punishmentType: params.get("casetype") || undefined,
    statement: params.get("statement") || undefined,
    reason: params.get("reason") || undefined,
    token: params.get("token") || undefined,
  };

  if (
    payload.statement != undefined &&
    payload.reason != undefined &&
    payload.punishmentType != undefined
  ) {
    const userInfo = decodeJwt(payload.token!);

    const blockedUsers: string[] = JSON.parse(
      `[${process.env.BLOCKED_USERS || ""}]`
    );
    if (blockedUsers.indexOf(userInfo.id) > -1) {
      return {
        statusCode: 303,
        headers: {
          Location: `/error?msg=${encodeURIComponent(
            "You cannot submit ban appeals with this Discord account."
          )}`,
        },
      };
    }

    const message: RESTPostAPIChannelMessageJSONBody = {
      embeds: [
        {
          title: "New appeal submitted!",
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Submitter",
              value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`,
            },
            {
              name: "Submitter Email",
              value: userInfo.email,
            },
            {
              name: "Type of punishment",
              value: payload.punishmentType,
            },
            {
              name: "User Statement",
              value: payload.statement,
            },
            {
              name: "Reason",
              value: payload.reason,
            },
          ],
        },
      ],
    };
    if (payload.caseid != undefined)
      message.embeds![0]?.fields?.splice(2, 0, {
        name: "Case ID",
        value: payload.caseid,
      });
    if (process.env.GUILD_ID) {
      try {
        const ban = await getBan(userInfo.id, process.env.GUILD_ID);
        if (ban !== null && ban.reason) {
          message.embeds![0]!.footer = {
            text: `Original ban reason: ${ban.reason}`.slice(
              0,
              MAX_EMBED_FOOTER_CHARS
            ),
          };
        }
      } catch (e) {
        console.log(e);
      }
    }

    const result = await makeRequest<RESTPostAPIChannelMessageResult>({
      method: "POST",
      route: Routes.channelMessages(<string>process.env.APPEALS_CHANNEL),
      body: message,
    });

    if (result.ok)
      return {
        statusCode: 303,
        headers: {
          Location: "/success",
        },
      };

    console.log(result.err);
    throw new Error("Failed to submit message");
  }

  return {
    statusCode: 400,
  };
};
