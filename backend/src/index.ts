import { Hono } from 'hono'
import { PrismaClient } from './generated/prisma/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    SECRET_KEY: string
  } // to define the type of the env used 
}>()


app.use('/api/v1/blog/*', async (c, next) => {

  const headers = c.req.header("Authorization") || "" /// the "" is for undefined type or we can check if the header is missing ↓
  // if (!headers) {
  //   c.status(401);
  //   return c.json({ error: "Authorization header missing" });
  // }
  const token = headers.split(" ")[1]
  const response = await verify(token, c.env.SECRET_KEY)
  if (!response) {
    c.status(401);
    return c.json({ error: "Authorization header missing" });
  }else 
  await next()
})

app.post('/api/v1/user/signup', async(c)=> {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body =  await c.req.json()

   try {
    const user = await prisma.user.create({
     data: {
       email: body.email,
       password: body.password
     }
   })
   
   const secret = c.env.SECRET_KEY
   const token = await sign({id: user.id}, secret)
 
   return c.json({token})
   } catch (error) {
    c.status(403);
		return c.json({ error: "error while signing up" });

   }

})
app.post('/api/v1/user/signin', async(c)=> {
   const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body =  await c.req.json()

   const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  })

  if(!user) {
    c.status(403);
		return c.json({ error: "user not found" });
  }
  
  const secret = c.env.SECRET_KEY
  const token = await sign({id: user.id}, secret)

  return c.json({token})
 
})
app.post('api/v1/blog', (c)=> {
  return c.text('Hello Hono!')
})
app.put('api/v1/blog', (c)=> {
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog/:id', (c)=> {
  const id:string = c.req.param("id")
  console.log(id);
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog/bulk', (c)=> {
  return c.text('Hello Hono!')
}) 


export default app
