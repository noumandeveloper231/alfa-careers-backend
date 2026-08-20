import jwt from 'jsonwebtoken'
import authModel from '../models/authModels.js';

export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication Failed! Please Login Again" })
        }

        let tokenDecode
        try {
            tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await authModel.findById(tokenDecode.userId);

        if (!user) {
            return res.json({ success: false, message: "User Not Found" })
        }

        req.user = user;
        next()
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export default userAuth;