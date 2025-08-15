
const verifySecretKey = (req, res) => {
  const providedKey = req.headers["x-secret-key"] || req.body.secretKey;
  if (!providedKey || providedKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(401).json({ message: "Unauthorized: Invalid secret key" });
    return false;
  }
  return true;
};
export default verifySecretKey;