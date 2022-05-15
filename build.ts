import { REST } from "@discordjs/rest";
import { unlink } from "fs";
import { resolve } from "path";
import { type RESTGetAPIUserResult, Routes } from "discord-api-types/v10";

async function main() {
  if (process.env.DISABLE_UNBAN_LINK) {
    const unban = resolve(__dirname, "func", "unban.js");
    unlink(unban, (err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
  }

  const client = new REST();
  client.setToken(<string>process.env.DISCORD_TOKEN);

  try {
    await (<Promise<RESTGetAPIUserResult>>(
      client.get(Routes.user("780995336293711875"))
    ));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
