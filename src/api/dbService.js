import supabase from "../supabaseClient";

/**
 * Core database service for standardized Supabase operations
 * This service centralizes all database operations with consistent error handling
 */

/**
 * Execute a database query with proper error handling
 * @param {Function} queryFn - Function that returns a Supabase query
 * @param {string} errorMsg - Custom error message
 * @returns {Promise<any>} Query result
 */
export const executeQuery = async (queryFn, errorMsg = "Database query failed") => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message || errorMsg);
    }
    
    return data;
  } catch (error) {
    console.error("Query execution error:", error);
    throw new Error(error.message || errorMsg);
  }
};

/**
 * Fetch multiple records with filtering
 * @param {string} table - Table name
 * @param {Object} options - Query options (select, filters)
 * @returns {Promise<Array>} Array of records
 */
export const fetchRecords = async (table, options = {}) => {
  const { select = "*", filters = [], order = null } = options;
  
  return executeQuery(() => {
    let query = supabase.from(table).select(select);
    
    // Apply filters
    filters.forEach(filter => {
      const { column, operator = "eq", value } = filter;
      query = query[operator](column, value);
    });
    
    // Apply ordering
    if (order) {
      const { column, ascending = true } = order;
      query = query.order(column, { ascending });
    }
    
    return query;
  }, `Failed to fetch records from ${table}`);
};

/**
 * Fetch a single record by ID
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {string} select - Columns to select
 * @returns {Promise<Object>} Record data
 */
export const fetchById = async (table, id, select = "*") => {
  return executeQuery(() => {
    return supabase
      .from(table)
      .select(select)
      .eq("id", id)
      .single();
  }, `Failed to fetch ${table} with ID ${id}`);
};

/**
 * Insert a record into a table
 * @param {string} table - Table name
 * @param {Object|Array} data - Data to insert
 * @param {Object} options - Insert options
 * @returns {Promise<Object>} Inserted data
 */
export const insertRecord = async (table, data, options = {}) => {
  const { returning = "*", upsert = false } = options;
  
  return executeQuery(() => {
    let query = supabase.from(table).insert(data);
    
    if (returning) {
      query = query.select(returning);
    }
    
    if (upsert) {
      query = query.upsert(data);
    }
    
    return query;
  }, `Failed to insert into ${table}`);
};

/**
 * Update a record
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated data
 */
export const updateRecord = async (table, id, data) => {
  return executeQuery(() => {
    return supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select();
  }, `Failed to update ${table} with ID ${id}`);
};

/**
 * Delete a record
 * @param {string} table - Table name
 * @param {string|number} id - Record ID
 * @returns {Promise<Object>} Deleted record
 */
export const deleteRecord = async (table, id) => {
  return executeQuery(() => {
    return supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select();
  }, `Failed to delete from ${table} with ID ${id}`);
};

/**
 * Count records with optional filtering
 * @param {string} table - Table name
 * @param {Array} filters - Optional filters
 * @returns {Promise<number>} Record count
 */
export const countRecords = async (table, filters = []) => {
  return executeQuery(() => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    
    // Apply filters
    filters.forEach(filter => {
      const { column, operator = "eq", value } = filter;
      query = query[operator](column, value);
    });
    
    return query;
  }, `Failed to count records in ${table}`)
    .then(result => result.count);
};

export default {
  fetchRecords,
  fetchById,
  insertRecord,
  updateRecord,
  deleteRecord,
  countRecords,
  executeQuery
};