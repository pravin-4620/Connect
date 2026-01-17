export const success = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors })
    });
};

export const paginated = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
        }
    });
};
