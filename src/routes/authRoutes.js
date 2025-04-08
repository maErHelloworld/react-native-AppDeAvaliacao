import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d"});

};

router.post("/register", async (req, res) => {
try {
    const {email,username,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({ message: "Preenche todos os campos"});
    }
    if(password.length < 6){
        return res.status(400).json({ message: "Palavrapasse tem de conter pelo menos 6 caracteres"});
    }
    if(username.length < 3){
        return res.status(400).json({ message: "Nome de usúario deve conter pelo menos 3 caracteres"});
    }

    //check if user allready exists

const existingEmail = await User.findOne({ email });
if (existingEmail) {
    return res.status(400).json({ message: "Email já existe"});
}

const existingUsername = await User.findOne({ username });
if (existingUsername) {
    return res.status(400).json({ message: "Nome de usúario já existe"});
}

//avatar random para quando não se tem foto de perfil
const profileImage = `https://api.dicebear.com/7.x/avataaars7svg?seed=${username}`;

const user = new User({
email,
username,
password,
profileImage,
});

await user.save();

const token = generateToken(user._id);

res.status(200).json({
    token,
    user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
    },
});



} catch (error) {
    console.log("Erro na rota de registry", error);
    res.status(500).json({ message: "Internal server error"});
    
}
});
router.post("/login", async (req, res) => {
   try {

    const { email, password } = req.body;
    if (!email || !password ) return res.status(400).json({ message: "Preenche todos os campos"});
    
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: "Usuário não existe"});

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect) return res.status(400).json({ message: "Credenciais inválidas"});

    const token = generateToken(user._id);

    res.status(200).json({
token,
user:{
id: user._id,
username: user.username,
email: user.email,
profileImage: user.profileImage,
},
    });

   } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error"});
   }
});

export default router;