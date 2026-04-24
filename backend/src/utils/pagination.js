/**
 * Standardized pagination helper.
 * Parses page/limit from query params and returns Sequelize-compatible offset/limit.
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Formats paginated response consistently across all endpoints.
 */
export function paginatedResponse(rows, count, { page, limit }) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}
