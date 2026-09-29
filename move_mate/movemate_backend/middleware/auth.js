const jwt = require("jsonwebtoken");
const config = require("../config");
const prisma = require("../database");

function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function createAuthorize(getCurrentRole) {
  return (...roles) => async (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }

    let currentRole;
    try {
      currentRole = await getCurrentRole(Number(req.user.id));
    } catch (error) {
      console.error("Could not verify the current user role.", error);
      return res.status(500).json({ message: "Could not verify permissions." });
    }

    if (!currentRole || !roles.includes(currentRole)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }

    req.user.role = currentRole;
    next();
  };
}

const authorize = createAuthorize(async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role || null;
});

module.exports = { protect, authorize, createAuthorize };
