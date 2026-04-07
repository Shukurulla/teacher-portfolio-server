const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // So'rov kelganda log
  console.log(
    `\n[${timestamp}] --> ${req.method} ${req.originalUrl} | IP: ${req.ip}`
  );

  if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "***";
    console.log(`[${timestamp}] Body:`, JSON.stringify(safeBody));
  }

  // Javob qaytganda log
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    if (status >= 400) {
      console.error(
        `[${timestamp}] <-- ${req.method} ${req.originalUrl} | Status: ${status} | ${duration}ms | Error: ${body?.message || JSON.stringify(body)}`
      );
    } else {
      console.log(
        `[${timestamp}] <-- ${req.method} ${req.originalUrl} | Status: ${status} | ${duration}ms`
      );
    }

    return originalJson(body);
  };

  next();
};

export default logger;
