import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const redirectUri = new URL(
    "/.netlify/functions/oauth-callback",
    process.env.URL
  );

  let url = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(
    <string>process.env.DISCORD_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    redirectUri.toString()
  )}&response_type=code&scope=identify%20email&prompt=none`;

  if (event.queryStringParameters?.state !== undefined) {
    url += `&state=${encodeURIComponent(event.queryStringParameters.state)}`;
  }

  return {
    statusCode: 303,
    headers: {
      Location: url,
    },
  };
};
