import express from "express";
import { register, login, logout, deleteUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout',isLoggedIn,logout);
router.get('/',isLoggedIn,getUsers)
router.delete('/:id',isLoggedIn,deleteUser)
router.put('/update',isLoggedIn,updateUser);

export default router;
