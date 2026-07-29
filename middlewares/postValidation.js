function postValidation(req, res, next) {
    const { title, image, category_id, description, content, status_id } = req.body;

    //title ต้องถูกส่งเข้ามา และต้องมี Type เป็น String
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    if (typeof title !== "string") {
        return res.status(400).json({ message: "Title must be a string" });
    }

    
    //image ต้องถูกส่งเข้ามา และต้องมี Type เป็น String
    if (!image) {
        return res.status(400).json({ message: "Image is required" });
    }
    
    if (typeof image !== "string") {
        return res.status(400).json({ message: "Image must be a string URL" });
    }

    //category_id ต้องถูกส่งเข้ามา และต้องมี Type เป็น Number
    if (!category_id) {
        return res.status(400).json({ message: "Category ID is required" });
    }
  
    if (typeof category_id !== "number") {
        return res.status(400).json({ message: "Category ID must be a number" });
    }


    //description ต้องถูกส่งเข้ามา และต้องมี Type เป็น String
    if (!description) {
        return res.status(400).json({ message: "Description is required" });
    }

    if (typeof description !== "string") {
        return res.status(400).json({ message: "Description is must be a string" });
    }
  
    //content ต้องถูกส่งเข้ามา และต้องมี Type เป็น String
    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }
  
    if (typeof content !== "string") {
        return res.status(400).json({ message: "Content is must be a string" });
    }


    //status_id ต้องถูกส่งเข้ามา และต้องมี Type เป็น Number
    if (!status_id) {
        return res.status(400).json({ message: "Status ID is required" });
    }
    
    if (typeof status_id !== "number") {
        return res.status(400).json({ message: "Status ID must be a number" });
    }
    
    next();

}

export default postValidation;