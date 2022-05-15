import { REST } from "@discordjs/rest";

export const MAX_EMBED_FIELD_CHARS = 1024;
export const MAX_EMBED_FOOTER_CHARS = 2048;
export const restClient = (token?: string) =>
  new REST().setToken(token || <string>process.env.DISCORD_TOKEN);
