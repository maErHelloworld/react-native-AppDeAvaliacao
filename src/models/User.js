import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
email:{
    type: String,
    required: true,
    unique: true
},
username:{
    type: String,
    required: true,
    unique: true
},
password:{
    type: String,
    required: true,
    unique: true,
    minlength: 6
},
profileImage:{
    type: String,
    default:""
},
}, { timestamps: true});

//password hash

userSchema.pre("save", async function(next) {
if(!this.isModified("password")) return next();

const salt = await bcrypt.genSalt(8);
this.password = await bcrypt.hash(this.password, salt);

next()
})

// compare password func
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);
// users

export default User;
