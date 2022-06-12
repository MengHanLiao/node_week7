const handleSuccess = (res, data) => {
  res.status(200).send({
    status: "success",
    data
  })
};

module.exports = handleSuccess;