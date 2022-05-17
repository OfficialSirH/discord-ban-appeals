import { unlink } from "fs";
import { resolve } from "path";
import { type RESTGetAPIUserResult, Routes } from "discord-api-types/v10";
import type { makeRequest as MakeRequestFunction } from "func/helpers/discord-helpers";

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
    const netlifyPath = ".netlify/functions/helpers/discord-helpers";
    const makeRequest: typeof MakeRequestFunction = (await import(netlifyPath))
      .makeRequest;
    await makeRequest<RESTGetAPIUserResult>({
      route: Routes.user("780995336293711875"),
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
