import { Context, Next } from "hono";
import { env } from "hono/adapter";
import { Jwt } from "hono/utils/jwt";

export async function authMiddleware(c: Context, next: Next) {
  const JWT_SECRET = env("JWT_SECRET") || "mytoken"; // Use environment variable for the secret
  
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader) {
      return c.body("Unauthorized: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return c.body("Unauthorized: Invalid token format", 401);
    }

    const decoded = await Jwt.verify(token, JWT_SECRET);

    if (decoded) {
      c.set("userId", decoded.id); // Assuming 'id' is part of the decoded token
      await next();
    } else {
      return c.body("Unauthorized: Token verification failed", 401);
    }
  } catch (error) {
    console.error("Authentication error:", error); // Log error for debugging
    return c.body("Unauthorized: " + (error.message || "Token verification failed"), 401);
  }
}
