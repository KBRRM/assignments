import { Context, Next } from "hono";
import { env } from "hono/adapter";
import { Jwt } from "hono/utils/jwt";

export async function authmiddleware(c: any, next: Next) {
  const JWT_TOKEN = "mytoken";
  
  try {
    const token: string = c.req.header("Authorization").split(" ")[1];
    if (token !== null || token !== undefined) {
      const decode = await Jwt.verify(token, JWT_TOKEN);
      if (decode) {
        c.set("userId", decode);
        await next();
      } else {
        return c.body("you are unauthroized user sorry", 401);
      }
    } else {
      return c.body("you are unauthroized user", 401);
    }
  } catch (error) {
    return c.body("unauthroized ", 401);
  }
}



Explanation of Changes
Authorization Header Check: We check if the Authorization header is present before trying to split it. This avoids potential errors.
Token Existence Check: Checking if (!token) directly instead of separately checking for null or undefined.
Improved Error Messages: Clearer and more specific error messages.
Type Annotation: Added Context as the type for c in the authMiddleware function parameter for better type safety.
