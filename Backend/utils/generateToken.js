import jwt from "jsonwebtoken";

const genrateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT, { expiresIn: "1y" });
};

export default genrateToken;
