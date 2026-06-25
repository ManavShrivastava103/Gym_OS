const userModel = require("../models/user.model.js");
const roleModel = require("../models/role.model.js");

function requirePermission(permission) {
    return async function(req, res, next) {
        try {
            if (!req.user || req.user.type !== "user") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access!"
                });
            }

            const user = await userModel.findById(req.user.userId);

            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: "User not found!"
                });
            }

            const role = await roleModel.findById(user.role);

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: "Role not found!"
                });
            }

            const permissions = role.permissions || [];

            const allowed = permissions.includes("all") || permissions.includes(permission);

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "Permission denied!"
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed!"
            });
        }
    };
}

module.exports = requirePermission;