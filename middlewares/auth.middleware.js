import {AppError} from "../utils/appError.js";
import asyncHandler from "./asyncHandler.middleware.js";

import jwt from 'jsonwebtoken';

const isLoggedIn = asyncHandler(async (req,res,next) =>{
    const {token} = req.cookies;

    if(!token){
        return next(new AppError('You are not logged in',401));
    }

    const tokenDetails = jwt.verify(token,process.env.JWT_SECRET);

    if(!tokenDetails){
        return next(new AppError('The token has expired',401));
    }

    req.user = tokenDetails;
    next();
});

export {
    isLoggedIn
}