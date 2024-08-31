import { Context, Next } from "hono";
import { verify } from "hono/jwt";


async function authmiddleware(c: Context, next: Next) {
    const header = c.req.header("Authorization") || ""
    if (!header) {
        c.json({ error: 'Authorization header missing' }, 401)
    }
    try {
        const token = header.split(" ")[1];
        const payload = await verify(token, c.env.JWT_SECRET);
        if (payload.id) {
            c.set("userId", payload.id)
            await next()
        }
        else {
            return c.json({ error: 'Invalid token' }, 401);
        }
    } catch (error) {
        return c.json({ error: 'token verification failed' }, 401)
    }
}
export default authmiddleware;