exports.advancedResults =
  (model, queryDb, populate) => async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    if (queryDb) {
      query = model.find(queryDb);
    } else {
      query = model.find();
    }

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    let page = parseInt(req.query.page, 10) || 1;

    const limit = parseInt(req.query.limit, 10) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }
    const results = await query.select("-blockedUsers");

    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page++,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page--,
        limit,
      };
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      data: results,
    };
    next();
  };
