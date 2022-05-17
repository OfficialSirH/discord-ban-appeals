import { unlink } from "fs";
import { resolve } from "path";
import { Routes } from "discord-api-types/v10";
import fetch from "node-fetch";

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

  try {
    await fetch(
      `https://discord.com/api/v10${Routes.user("780995336293711875")}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      }
    );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
