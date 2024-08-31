import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import authmiddleware from "../middlewares/authmiddleware";
import { createBlogInput, updateBlogInput } from "@satyamt154/zod-medium";

const blogRouter = new Hono<
    {
        Bindings: {
            DATABASE_URL: string,
            JWT_SECRET: string
        },
        Variables:{
            userId: string
        }
    }>();

blogRouter.use('/blog/*', authmiddleware)

blogRouter.get('/', async (c) => {
    const blogs = c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const response = await prisma.post.findMany();
        return c.json({response}, 200)  
    } catch (error) {
        c.json({msg: "error withe fetching"}, 200)
    }
});

blogRouter.get('/blog/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const id = c.req.param('id');
        const blog = await prisma.post.findUnique({
            where:{
                id: Number(id)
            }
        })
        if (blog) {
            return c.json({ "blog": blog }, 200)
        }
    } catch (error) {
        return c.json({ msg: "Error while fetching" }, 411)
    }
});

blogRouter.post('/blog', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const authorId = c.get("userId")
        const body = await c.req.json();
        const { success } = createBlogInput.safeParse(body);
        if(!success){
            return c.json({
                msg: "invalid input-type",
            },411)
        }
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId)
            }
        })
        if (blog.id) {
            return c.json({ "blogId": blog.id }, 200)
        }
    } catch (error) {
        return c.json({ msg: "Error while creating" }, 400)
    }
});

blogRouter.put('/blog', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const authorId = c.get('userId')
        const body = await c.req.json();
        const { success } = updateBlogInput.safeParse(body);
        if(!success){
            return c.json({
                msg: "invalid input-type",
            },411)
        }
        const blog = await prisma.post.update({
            where:{
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId),
                updatedAt: new Date()
            }
        })
        if (blog.id) {
            return c.json({ "blogId": blog.id, msg: "success-updating" }, 200)
        }
    } catch (error) {
        return c.json({ msg: "Error while updating" }, 400)
    }    
});

export default blogRouter