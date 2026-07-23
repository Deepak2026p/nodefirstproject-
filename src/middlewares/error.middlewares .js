import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) =>{
    let error = err;

    if(!(error instanceof ApiError)){
     const  statusCode = err.statusCode || 500;
     const message = err.message || "Somethink went wrong";
     error = new ApiError(statusCode, message, error.errors|| [], err.stack);
    }

    const response = {
       success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };
  return  res.status(error.statusCode || 500).json(response)
}

export {errorHandler};