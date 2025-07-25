import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Middleware to authenticate and attach userId and userDetails to the request object
const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If token is missing,
  // return a 401 Unauthorized response
  if (!token) {
    // @ts-ignore
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token with your secret
    const decoded: any = jwt.verify(token, "your_jwt_secret");

    // Ensure that decoded contains the user ID (or other user details)
    if (decoded && decoded.id) {
      // Attach user details to the request object
      req.body.userDetails = { id: decoded.id }; // Add more details if needed
      next(); // Pass control to the next middleware or route handler
    } else {
      // @ts-ignore
      return res.status(401).json({ message: "Invalid token payload" });
    }
  } catch (error) {
    // @ts-ignore
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;
