import { Context, Next } from "hono";
import { Jwt } from "hono/utils/jwt";

export async function authMiddleware(c: Context, next: Next) {
  const JWT_TOKEN = "mytoken";
  
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.body("Authorization header missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return c.body("Token missing in Authorization header", 401);
    }

    const decoded = await Jwt.verify(token, JWT_TOKEN);
    if (decoded) {
      c.set("userId", decoded);
      return next();
    } else {
      return c.body("Unauthorized user", 401);
    }
  } catch (error) {
    return c.body("Unauthorized due to invalid token", 401);
  }
}
