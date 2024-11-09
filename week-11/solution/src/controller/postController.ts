import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Context } from 'hono';

enum StatusCode {
  BADREQ = 400,
  NOTFOUND = 404,
  NOTPERMISSION = 403,
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,  // You can configure the URL here globally if needed
}).$extends(withAccelerate());

const handleError = (error: Error, c: Context) => {
  console.error(error);  // Log the error for debugging purposes
  return c.body(`Internal server error: ${error.message}`, 500);
};

const handleNotFound = (message: string, c: Context) => {
  return c.body(message, StatusCode.NOTFOUND);
};

export async function getPosts(c: Context) {
  try {
    const response = await prisma.posts.findMany({
      include: {
        tags: true,
        User: { select: { username: true, id: true } },
      },
    });
    return c.json({
      post: response.map((res) => ({
        id: res.id,
        username: res.User.username,
        userId: res.User.id,
        title: res.title,
        body: res.body,
        tags: res.tags,
        createdAt: res.createdAt,
      })),
    });
  } catch (error) {
    return handleError(error, c);
  }
}

export async function getUserPosts(c: Context) {
  try {
    const userId = c.get('userId');
    const posts = await prisma.posts.findMany({
      where: { userId },
    });
    return c.json({ post: posts });
  } catch (error) {
    return handleError(error, c);
  }
}

export async function createPost(c: Context) {
  try {
    const body: { title: string; body: string; tags: string } = await c.req.json();
    const tagNames = body.tags.split(',').map((tag) => tag.trim());

    if (!body.title || !body.body) {
      return c.body('Invalid user input', StatusCode.BADREQ);
    }

    const res = await prisma.posts.create({
      data: {
        title: body.title,
        body: body.body,
        userId: c.get('userId'),
        tags: {
          connectOrCreate: tagNames.map((tag) => ({
            where: { tag },
            create: { tag },
          })),
        },
      },
      include: { tags: true },
    });

    return c.json({
      message: 'Post successfully created',
      post: {
        id: res.id,
        title: res.title,
        body: res.body,
        tags: res.tags.map((tag) => tag.tag),
        createdAt: res.createdAt,
      },
    });
  } catch (error) {
    return handleError(error, c);
  }
}

export async function getPost(c: Context) {
  try {
    const id: number = Number(c.req.param('id'));
    const post = await prisma.posts.findFirst({
      where: { id, userId: c.get('userId') },
      include: { tags: true },
    });

    if (!post) {
      return handleNotFound('Post does not exist', c);
    }

    return c.json({
      data: {
        id: post.id,
        title: post.title,
        body: post.body,
        tags: post.tags,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    return handleError(error, c);
  }
}

export async function updatePost(c: Context) {
  try {
    const id: number = Number(c.req.param('id'));
    const body: { title: string; body: string; tags: string } = await c.req.json();
    const tagNames = body.tags.split(',').map((tag) => tag.trim());

    const post = await prisma.posts.findFirst({
      where: { id, userId: c.get('userId') },
    });

    if (!post) {
      return handleNotFound('Post does not exist', c);
    }

    const updatedPost = await prisma.posts.update({
      where: { id, userId: c.get('userId') },
      data: {
        title: body.title,
        body: body.body,
        tags: {
          connectOrCreate: tagNames.map((tag) => ({
            where: { tag },
            create: { tag },
          })),
        },
      },
      include: { tags: true },
    });

    return c.json({
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        body: updatedPost.body,
        tags: updatedPost.tags,
        createdAt: updatedPost.createdAt,
      },
    });
  } catch (error) {
    return handleError(error, c);
  }
}

export async function deletePost(c: Context) {
  try {
    const id: number = Number(c.req.param('id'));
    const post = await prisma.posts.findFirst({
      where: { id, userId: c.get('userId') },
    });

    if (!post) {
      return handleNotFound('Post does not exist', c);
    }

    await prisma.posts.delete({
      where: { id, userId: c.get('userId') },
    });

    return c.json({ message: 'Post deleted' });
  } catch (error) {
    return handleError(error, c);
  }
}
