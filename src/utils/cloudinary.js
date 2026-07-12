import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) throw new Error("File is Not Found");
        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log("File is uploade on cloudinary successfully", response);
        fs.unlinkSync(localFilePath);

        return response;
    }
    catch(err){
        console.log("Error while uploading file on cloudinary", err);
        fs.unlinkSync(localFilePath);
        throw err;
    }
}

export {uploadOnCloudinary};