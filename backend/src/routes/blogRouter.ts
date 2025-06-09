import { Hono } from "hono"
import { verify } from "hono/jwt"
import { PrismaClient } from "../generated/prisma/edge"
import { withAccelerate } from "@prisma/extension-accelerate"


export  const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    SECRET_KEY: string
  },
  Variables: {
  userId: string;
}; // to define the type of the env used 
}>()


blogRouter.use('/*', async (c, next) => {

  const headers = c.req.header("Authorization") || "" /// the "" is for undefined type or we can check if the header is missing ↓
  // if (!headers) {
  //   c.status(401);
  //   return c.json({ error: "Authorization header missing" });
  // }
  const user = await verify(headers, c.env.SECRET_KEY)
  if (user) {
    c.set("userId",user.id as string)
     await next()
  } 
  c.status(401);
    return c.json({ error: "Authorization header missing" });
})


blogRouter.post('/', async(c)=> {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const userId = c.get('userId');
    const body = await c.req.json()
    
    const post = await prisma.post.create({
         data: {
            title: body.title,
            content: body.content,
            authorId: userId
    }
    })
  return c.json({
		id: post.id
	});
})


blogRouter.put('/', async(c)=> {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const userId = c.get('userId');
    const body = await c.req.json()
    
    const post = await prisma.post.update({
        where: {
            id: body.id, // post id 
            authorId: userId 
        },
         data: {
            title: body.title,
            content: body.content,
       
    }
    })
    return c.text('updated post');
})

//need to add pagination
blogRouter.get('/bulk', async(c)=> {
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
  	const post = await prisma.post.findMany();

	return c.json(post);
}) 

blogRouter.get('/:id', async(c)=> {
  const id:string = c.req.param("id")
  console.log(id);
  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
  	const post = await prisma.post.findUnique({
		where: {
			id: id
		}
	});

	return c.json(post);

})


