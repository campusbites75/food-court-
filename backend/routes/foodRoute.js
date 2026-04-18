import express from 'express';
import multer from 'multer';

import { 
    addFood, 
    listFood, 
    removeFood,
    toggleFoodStatus, 
    updateQuantity
} from '../controllers/foodController.js';

const foodRouter = express.Router();


// ================================
// IMAGE STORAGE (MULTER)
// ================================
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


// ================================
// ROUTES
// ================================

// ✅ Get all foods
foodRouter.get("/list", listFood);

// ✅ Add food (with image)
foodRouter.post("/add", upload.single('image'), addFood);

// ✅ Remove food
foodRouter.post("/remove", removeFood);

// ✅ Pause / Resume food
foodRouter.post("/toggle-status", toggleFoodStatus);

// ✅ 🔥 FIXED: Update quantity (THIS WAS MISSING)
foodRouter.post("/update-quantity", updateQuantity);


export default foodRouter;
