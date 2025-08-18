export function yuvrajAdminOnly(req, res, next) {
  const key = req.header("x-admin-key");
  
  console.log("Admin middleware - Request headers:", {
    'x-admin-key': key ? '***' : 'NOT SET',
    'x-institution-id': req.header("x-institution-id"),
    'content-type': req.header("content-type")
  });
  
  if (!process.env.ADMIN_SECRET) {
    console.warn("ADMIN_SECRET not set - allowing all admin requests");
    return next();
  }
  
  if (key === process.env.ADMIN_SECRET) {
    console.log("Admin authentication successful");
    return next();
  }
  
  console.error("Admin authentication failed - key mismatch");
  return res.status(401).json({ message: "Admin authentication required" });
}


