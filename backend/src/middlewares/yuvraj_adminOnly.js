export function yuvrajAdminOnly(req, res, next) {
  const key = req.header("x-admin-key");
  if (process.env.ADMIN_SECRET && key === process.env.ADMIN_SECRET) return next();
  // If no ADMIN_SECRET is set, allow in dev to simplify demo
  if (!process.env.ADMIN_SECRET) return next();
  return res.status(401).json({ message: "Admin only" });
}


