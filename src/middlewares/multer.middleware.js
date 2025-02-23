import multer from "multer";
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage
(
    {
        destination: function(req,file,cb)
        {
            const uploadPath = path.join('C:\\Users\\Parth garg\\OneDrive\\Desktop\\vidtube replica\\public',"temp")
            if(!fs.existsSync(uploadPath))
            {
                fs.mkdirSync(uploadPath,{recursive:true});
            }

            cb(null, uploadPath)
        },
        filename: function(req,file,cb)
        {
            cb(null, file.originalname);
        }
    }
)

export const upload = multer({storage: storage})