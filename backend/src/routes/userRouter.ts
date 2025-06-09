import { Hono } from "hono"
import { PrismaClient } from '../generated/prisma/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

export  const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    SECRET_KEY: string
  } // to define the type of the env used 
}>()

userRouter.post('/signup', async(c)=> {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body =  await c.req.json()

// this if from the common section after the paakge upload 

//    const { success }=  signupInput.safeParse(body)
  
//     if(!success){
//         c.status(411)
//         return c.json({
//             message: "invalid credentials"
//         })
//     }
   try {
    const user = await prisma.user.create({
     data: {
       email: body.email,
       password: body.password,
       name: body.name
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

userRouter.post('/signin', async(c)=> {
   const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

  const body =  await c.req.json()
  
//   const { success }=  signinInput.safeParse(body)

//     if(!success){
//         c.status(411)
//         return c.json({
//             message: "invalid credentials"
//         })
//     }

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
