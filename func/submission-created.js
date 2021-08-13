const fetch = require("node-fetch");

const { API_ENDPOINT, MAX_EMBED_FIELD_CHARS, MAX_EMBED_FOOTER_CHARS } = require("./helpers/discord-helpers.js");
const { createJwt, decodeJwt } = require("./helpers/jwt-helpers.js");
const { getBan } = require("./helpers/user-helpers.js");

exports.handler = async function (event, context) {
    let payload;

    if (process.env.USE_NETLIFY_FORMS) {
        payload = JSON.parse(event.body).payload.data;
    } else {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405
            };
        }

        const params = new URLSearchParams(event.body);
        payload = {
            punishmentType: params.get('ban') || params.get('mute') || params.get('kick') || params.get('warning') || undefined,
            statement: params.get("banReason") || undefined,
            reason: params.get("appealText") || undefined
        };
    }

    if (payload.statement != undefined && payload.reason != undefined && payload.punishmentType != undefined) {
        
        const userInfo = decodeJwt(payload.token);
        
        const blockedUsers = JSON.parse(`[${process.env.BLOCKED_USERS || ""}]`);
        if (blockedUsers.indexOf(userInfo.id) > -1) {
            return {
                statusCode: 303,
                headers: {
                    "Location": `/error?msg=${encodeURIComponent("You cannot submit ban appeals with this Discord account.")}`,
                },
            };
        }
        
        const message = {
            embed: {
                title: "New appeal submitted!",
                timestamp: Date.now(),
                fields: [
                    {
                        name: "Submitter",
                        value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`
                    },
                    {
                        name: "Type of punishment",
                        value: payload.punishmentType
                    },
                    {
                        name: "User Statement",
                        value: payload.statement
                    },
                    {
                        name: "Reason",
                        value: payload.reason
                    }
                ]
            }
        }
        // TODO: edit stuff below this comment to do something else other than ban-related things
        if (process.env.GUILD_ID) {
            try {
                const ban = await getBan(userInfo.id, process.env.GUILD_ID, process.env.DISCORD_BOT_TOKEN);
                if (ban !== null && ban.reason) {
                    message.embed.footer = {
                        text: `Original ban reason: ${ban.reason}`.slice(0, MAX_EMBED_FOOTER_CHARS)
                    };
                }
            } catch (e) {
                console.log(e);
            }

            // if (!process.env.DISABLE_UNBAN_LINK) {
            //     const unbanUrl = new URL("/.netlify/functions/unban", process.env.URL);
            //     const unbanInfo = {
            //         userId: userInfo.id
            //     };
    
            //     message.embed.description = `[Approve appeal and unban user](${unbanUrl.toString()}?token=${encodeURIComponent(createJwt(unbanInfo))})`;
            // }
        }

        const result = await fetch(`${API_ENDPOINT}/channels/${encodeURIComponent(process.env.APPEALS_CHANNEL)}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
            },
            body: JSON.stringify(message)
        });

        if (result.ok) {
            if (process.env.USE_NETLIFY_FORMS) {
                return {
                    statusCode: 200
                };
            } else {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": "/success"
                    }
                };
            }
        } else {
            console.log(await result.json());
            throw new Error("Failed to submit message");
        }
    }

    return {
        statusCode: 400
    };
}
