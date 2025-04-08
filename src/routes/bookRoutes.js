import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.js";
import protectRoute from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/", protectRoute, async (req,res) => {
    try {
        const { title, caption, rating, image } = req.body;
        
    if (!image || !title || !caption || !rating){
         return res.status(400).json({ message: "Por favor preenche todos os campos" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url

    const newBook = new Book({
    title,
    caption,
    rating,
    image: imageUrl,
    user: req.user._id,
    })

    await newBook.save()
    
    res.status(201).json(newBook)

    } catch (error) {
        console.log("Error creating book");
        res.status(500).json({ message: error.message});
    }
});


// função para fazer fetch/get
//  de conteúdo ordeiramente, 
// não tudo de uma vez senão seria 
// desnecessário e tornaria a app extremamente lenta

router.get("/", protectRoute, async (req, es) => {
    try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 5;
            const skip = (page - 1) * limit;


        const books = await Book.find()
        .sort({ createdAt: -1 }) // ordena o conteúdo do mais novo para o mais antigo
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

            const totalBooks = await Book.countDocuments();

        res.send({
            books,
             currentPage: page,
             totalBooks,
             totalPages: Math.ceil(totalBooks / limit),
        });   
        } catch (error) {
            console.log("Erro ao carregar conteúdo", error);
             res.status(500).json({ message: "Internal Server error"});
        }
});

router.delete("/:id", protectRoute, async (req,res) => {
try {
    const book = await Book.findById(req.params.id);
    if(!book) return res.status(404).json({ message: "Conteúdo Não encontrado"});

    if (book.user.toString() !== req.user._id.toString())
        return res.status(401).json({ message: "Não autorizado"});

        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
                
            } catch (deleteError) {
                console.log("Erro ao aapgar imagem do cloudinary", deleteError);        
            }
        }
    await book.deleteOne();
    res.json({ message: "Conteúdo apagado com sucesso!"});

} catch (error) {
    console.log("Erro ao apagar conteúdo", error);
    res.status(500).json({ message: "Internal server error"});
}
});

router.get("/user", protectRoute, async (req, res) => {
try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
} catch (error) {
    console.error("Erro ao carregar conteúdo do usuário", error.message);
    res.status(500).json({ message: "Server error"});
}
});

//create delete update


export default router;