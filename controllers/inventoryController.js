// controllers/inventoryController.js
const { createConnection } = require('../config/database');
const { validateInventoryItem } = require('../utils/validation');

const getAllItems = async (req, res) => {
  try {
    const pool = createConnection();
    const result = await pool.query(
      'SELECT * FROM inventory WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getItemById = async (req, res) => {
  try {
    const pool = createConnection();
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM inventory WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Fetch inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createItem = async (req, res) => {
  try {
    const pool = createConnection();
    const {
      name,
      description,
      quantity,
      unit_price,
      category,
      supplier,
      min_stock_level,
      location,
      sku
    } = req.body;
    
    // Validate input
    const validation = validateInventoryItem(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const result = await pool.query(
      `INSERT INTO inventory (name, description, quantity, unit_price, category, supplier, min_stock_level, location, sku, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        description || '',
        parseInt(quantity) || 0,
        parseFloat(unit_price) || 0,
        category,
        supplier || '',
        parseInt(min_stock_level) || 0,
        location || '',
        sku,
        req.user.userId
      ]
    );

    res.status(201).json({
      message: 'Inventory item created successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateItem = async (req, res) => {
  try {
    const pool = createConnection();
    const { id } = req.params;
    const {
      name,
      description,
      quantity,
      unit_price,
      category,
      supplier,
      min_stock_level,
      location,
      sku
    } = req.body;

    // Validate input
    const validation = validateInventoryItem(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const result = await pool.query(
      `UPDATE inventory 
       SET name = $1, description = $2, quantity = $3, unit_price = $4, 
           category = $5, supplier = $6, min_stock_level = $7, location = $8, 
           sku = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [name, description, quantity, unit_price, category, supplier, min_stock_level, location, sku, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({
      message: 'Inventory item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'SKU already exists for another item' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const pool = createConnection();
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM inventory WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};