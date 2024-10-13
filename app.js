import express from "express";
import cookieParser from "cookie-parser";

import { config } from "dotenv";
config();

const app = express();

app.use(express.json());

app.use(cookieParser());

// importing Routes 
import userRoutes from "./routes/user.routes.js";

app.use('/api/v1/user',userRoutes);

app.use('*',(req,res) => {
    res.status(404).send("OPPS!! 404 page not found")
})

export {app}