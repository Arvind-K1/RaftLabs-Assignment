import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength : [6, 'Your password must be at least 6 characters'],
        select : false 
    }
},{
    timestamps: true
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    generateJWTToken : function(){
        return jwt.sign({
            id: this._id,
            role: this.role,
            email: this.email,
            subscription: this.subscription
        },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRY
    });

    }
    
}

const User = mongoose.model('User',userSchema);

export default User