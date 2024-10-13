import User from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";

import { AppError } from "../utils/appError.js";

const cookieOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7*24*60*60*1000,
    httpOnly: true
};

const register = asyncHandler( async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password){
        return next(new AppError('Please provide all fields', 400))
    }

    const userExists = await User.findOne({email});

    if(userExists){
        return next(new AppError('Email already in use', 400))
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if(!user){
        return next(new AppError('Failed to create user', 500))
    }
    
    await user.save();

    const token = await user.generateJWTToken();

    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: 'User registered Successfully',
        user
    })
});

const login = asyncHandler( async ( req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return next(new AppError('Please provide email and password',400));
    }

    const user = await User.findOne({email}).select('+password');

    if (!(user && (await user.comparePassword(password)))) {
        return next(
          new AppError('Email or Password do not match or user does not exist', 401)
        );
      }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token',token,cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User logged in successfully',
        user
    })
});

const logout = asyncHandler(async (_req,res,_next) => {
    res.cookie('token',null,{
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
});

const getUsers = asyncHandler( async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search = '' } = req.query;
    
    const query = search ? { name: new RegExp(search, 'i') } : {};

    const users = await User.find(query)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const count = await User.countDocuments(query);

    res.status(200).json({ users, count });
});

const deleteUser = asyncHandler( async (req, res) => {
    const id = req.params.id;

    if(!id){
        return next(new AppError('Please provide a valid user ID', 400))
    }

    await User.findByIdAndDelete(id);

    res.status(204).json({
        success: true,  
        message: 'User deleted successfully'
    })
});

const updateUser = asyncHandler( async (req, res) => {
    const { name, email } = req.body;
    const id = req.params.id;

    if(!name || !email){
        return next(new AppError('Please provide a valid user name and email', 400))
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true }
    );

    if(!updateUser){
        return next(new AppError('User not found', 404))
    }

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
    })

});

export {
    register,
    login,
    logout,
    getUsers,
    deleteUser,
    updateUser
}