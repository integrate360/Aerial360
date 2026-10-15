import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import UserM from "../models/userModel.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req?.headers?.authorization?.split(" ")[1];
    if (token) {
      try {
        const decode = jwt.verify(token, process.env.JWT);
        let user;
        user = await UserM.findById(decode.id);
        if (!user) user = await Admin.findById(decode.id);

        if (!user) {
          res.status(401);
          throw new Error("User not found");
        }

        req.user = user;
        next();
      } catch (error) {
        res.status(401);
        if (error.name === "TokenExpiredError") {
          throw new Error("Token expired. Please login again.");
        }
        throw new Error("Invalid Token");
      }
    } else {
      res.status(401);
      throw new Error("Invalid Token");
    }
  } else {
    res.status(401);
    throw new Error("You don't have a token to access this route");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const isAdmin = await Admin.findById(req?.user?._id);
  if (isAdmin) next();
  else {
    res.status(403);
    throw new Error("Not Authorized");
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req?.headers?.authorization?.split(" ")[1];
    if (token) {
      try {
        const decode = jwt.verify(token, process.env.JWT);
        let user = await UserM.findById(decode.id);
        if (!user) user = await Admin.findById(decode.id);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid/expired - continue as unauthenticated
      }
    }
  }
  next();
});

export { authMiddleware, isAdmin, optionalAuth };
