import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const redirectUri = new URL(
    `/.netlify/functions/oauth-callback?origin=${event.path}`,
    process.env.URL
  );

  const scope = event.path == "/form" ? "identify%20email" : "identify";

  let url = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(
    <string>process.env.DISCORD_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    redirectUri.toString()
  )}&response_type=code&scope=${scope}&prompt=none`;

  if (event.queryStringParameters?.state !== undefined) {
    url += `&state=${encodeURIComponent(event.queryStringParameters.state)}`;
  }

  if (
    event.queryStringParameters?.playerId !== undefined &&
    event.queryStringParameters.playerToken !== undefined
  ) {
    url += `&playerId=${encodeURIComponent(
      event.queryStringParameters.playerId
    )}&playerToken=${encodeURIComponent(
      event.queryStringParameters.playerToken
    )}`;
  }

  return {
    statusCode: 303,
    headers: {
      Location: url,
    },
  };
};
