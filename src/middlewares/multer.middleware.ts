import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) 
      // Well this is not very good approach but it works becuase only tiny distance is to be travelled
      // so after the complete project will make the change
    }
  })
  
 export const upload = multer({ 
    storage,
 })