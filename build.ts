import { Client } from "discord.js";
import { unlink } from "fs";
import { resolve } from "path";
import type { APIUser } from "discord-api-types/v10";

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

  // Make sure the bot actually exists by testing a request for a specific user.
  type APIUserRequest = {
    users: {
      [key: string]: {
        get: () => Promise<APIUser>;
      };
    };
  };

  const client = new Client({
    intents: [],
  });

  try {
    await (<APIUserRequest>client["api"]).users["780995336293711875"].get();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
