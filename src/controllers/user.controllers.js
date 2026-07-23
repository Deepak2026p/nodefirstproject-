import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { consumeCaptcha } from "../utils/captchaStore.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }
}

const verifyCaptcha = async (captchaId, captchaAnswer) => {

    if (!captchaId || !captchaAnswer) {
        throw new ApiError(400, "Captcha is Required")
    }

    const expectedText = await consumeCaptcha(captchaId)


    if (!expectedText) {
        throw new ApiError(400, "Captcha expired, please refresh and try again")
    }

    if (expectedText !== String(captchaAnswer).trim().toLowerCase()) {
        throw new ApiError(400, "Captcha answer is incorrect")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    //changes 
    const { username, email, full_name, password } = req.body

    if (
        [username, email, full_name, password].some((field) => String(field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    await verifyCaptcha(captchaId, captchaAnswer)

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullName: full_name,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req body -> email, password
    //validation - not empty
    //check if user exists with email
    //compare password with hashed password in db
    //generate access token and refresh token
    //save refresh token in db
    //return response with access token and refresh token

    const { email, password } = req.body
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    await verifyCaptcha(captchaId, captchaAnswer)
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
    }
    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully"))

})

const logoutUser = asyncHandler(async (req, res) => {
    //get refresh token from cookies
    //validate refresh token
    //remove refresh token from db
    //remove cookies
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined }, { new: true })
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0, // expire immediately
    }
    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (incomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized Error")
    }
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, 'Invalid refresh token')
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is Expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiError(200, {
            accessToken, refreshToken: newRefreshToken
        }, "Access Token refresh Succeflly"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
