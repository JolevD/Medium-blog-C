import { Hono } from 'hono'
import { userRouter } from './routes/userRouter'
import { blogRouter } from './routes/blogRouter'


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    SECRET_KEY: string
  } // to define the type of the env used 
}>()


app.route("/api/v1/user", userRouter)
app.route("/api/v1/blog", blogRouter)




export default app
