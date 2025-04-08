import jwt from "jsonwebtoken";
import User from "../models/User.js";

//verificação se user está log on ou não, caso não, não consegue criar item novo 

const protectRoute = async(req,res,next) => {
try {

    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Nenhum token de autentiação recebido, acesso negado"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Token inválido."});

    req.user = user;
    next();

} catch (error) {
    console.error("Erro de autenticação", error.message);
    res.status(401).json({ message: "Token inválido"});
}
};


export default protectRoute;