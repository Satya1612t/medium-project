import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from "hono/adapter";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@satyamt154/zod-medium";

//SPECIFY THE DATABASE TYPES
const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>();

//SIGNUP USER PATH
authRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
        if(!success){
            return c.json({
                msg: "invalid input-type",
            },411)
        }
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      }
    })
    if (user?.id) {
      const errorData = { error: 'Email already exists' };
      return c.json(errorData, 409);
    }

    const generate_user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }

    })
    const token = await sign({ id: generate_user.id }, c.env.JWT_SECRET)
    return c.json({
      token,
      msg: "User Created Successfully"
    }, 200)

  } catch (error) {
    console.log({ "Error": error });
  }
});

//SIGNIN USER PATH
authRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
        if(!success){
            return c.json({
                msg: "invalid input-type",
            },411)
        }
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      }
    })
    
    if (!user?.id) {
      const errorData = { error: 'invalid credentials' };
      return c.json(errorData, 409);
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({
      token,
      msg: "Login Successfully"
    }, 200)
  } catch (error) {
    console.log({ "Error": error });
  }
});


export default authRouter