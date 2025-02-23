import express from 'express'
import dotenv from 'dotenv'
import CORS from 'cors'
import cookieParser from 'cookie-parser';

const app = express()//find out about cors;

app.use(CORS(
    {
            origin:process.env.CORS,
            credentials:true,
    }
))

//logger
import logger from "./logger.js";
import morgan from "morgan";

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
//middlewares 
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:false,limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser());
//routers
import healthCheckRoute from './routes/healthcheck.route.js'
import registerRoute from './routes/register.route.js'
import loginRoute from './routes/login.route.js'
import { errorHandler } from './middlewares/error.middleware.js';
app.use('/api/v1/healthcheck',healthCheckRoute)
app.use('/api/v1/users',registerRoute)
app.use('/api/v1/users',loginRoute)

app.use(errorHandler);
//export
export default app