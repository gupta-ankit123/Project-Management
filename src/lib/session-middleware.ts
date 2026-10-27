import "server-only"

import {
    Account,
    Client,
    Databases as DatabaseType,
    Storage,
    Databases,
    Models,
    type Account as AccountType,
    type Storage as StorageType,
    type Users as UsersType
} from "node-appwrite"

import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"

import { AUTH_COOKIE } from "@/features/auth/constants"

type AdditionalContext = {
    Variables: {
        account: AccountType;
        databases: DatabaseType;
        storage: StorageType;
        users: UsersType;
        user: Models.User<Models.Preferences>;
    }
}

//  Why not just make one Client and reuse it for everyone? Because the client isn't just a "connector" — once you call .setSession(session)
//   on it, that client becomes "logged in as that user." If you had one shared client for all requests, and two people hit your server at
//   the same time, you'd get a race: User A's request might grab the client right after User B's session got set on it, and now User A is
//   accidentally acting as User B. That's a serious bug (mixing up users' identities/data).

export const sessionMiddleware = createMiddleware<AdditionalContext>(
    async (c, next) => {
        const client = new Client() // Every time a request comes in (someone hitting your API), this middleware runs fresh. It creates a brand-new Appwrite Client object just  for that one request, then attaches that specific user's session (their login cookie) to it. 
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const session = getCookie(c, AUTH_COOKIE) //here this session will act as a API key that we provided when creating an admin since this is a normal user we don't want to give them much power.
        if (!session) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        client.setSession(session)

        const account = new Account(client)
        const databases = new Databases(client)
        const storage = new Storage(client)

        const user = await account.get()

        c.set("account", account)
        c.set("databases", databases)
        c.set("storage", storage)
        c.set("user", user)

        await next()
    }
)