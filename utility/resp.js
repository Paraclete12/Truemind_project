exports.successResponse = (res, data, message = "Success") => {
  return res.status(200).json({
    status: "success",
    message,
    data
  });
};

exports.errorResponse = (res, message, status = 400) => {
  return res.status(status).json({
    status: "error",
    message
  });
};
