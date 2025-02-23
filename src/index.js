import app from './app.js'
import dotenv from 'dotenv'

dotenv.config
(
    {
        path:'./.env'//i have to check it out here wy we define te pat in this way and not in this way ---> ../.env as env is in outer path
    }
)

const PORT = process.env.PORT || 8888;


import dbConnection from './db/index.js';

dbConnection()
.then(()=>
{
    app.listen(PORT,()=>
    {
        console.log('Server connected successfully at',PORT)
    })
}).catch(error => 
    {console.log(`MongoDB connection error ${error}`)}
)