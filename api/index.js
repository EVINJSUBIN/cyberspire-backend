const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // To parse incoming JSON data

// Initialize SQLite database in-memory
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening in-memory database:', err.message);
  } else {
    console.log('Connected to in-memory SQLite database.');
    // Create a sample table for testing
    db.run("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)", (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Test table created');
      }
    });
  }
});

// **CREATE a table**
app.post('/create-table', (req, res) => {
  const { tableName, columns } = req.body;
  const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      res.status(500).send({ message: 'Error creating table', error: err.message });
    } else {
      console.log(`Table '${tableName}' created successfully.`);
      res.send({ message: `Table '${tableName}' created successfully.` });
    }
  });
});

// **INSERT data into a table**
app.post('/insert', (req, res) => {
  const { tableName, values } = req.body;

  // Ensure that values is an array of values, not a string
  if (!Array.isArray(values) || values.length === 0) {
    return res.status(400).send({ message: 'Values must be an array.' });
  }

  const placeholders = values.map(() => '?').join(',');
  const query = `INSERT INTO ${tableName} VALUES (${placeholders})`;

  db.run(query, values, function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      res.status(500).send({ message: 'Error inserting data', error: err.message });
    } else {
      console.log('Data inserted successfully');
      res.send({ message: 'Data inserted successfully', id: this.lastID });
    }
  });
});


// **READ data from a table**
app.get('/read/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const query = `SELECT * FROM ${tableName}`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error reading data:', err.message);
      res.status(500).send({ message: 'Error reading data', error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// **UPDATE data in a table**
app.put('/update', (req, res) => {
  const { tableName, updates, condition } = req.body;
  const query = `UPDATE ${tableName} SET ${updates} WHERE ${condition}`;

  db.run(query, function (err) {
    if (err) {
      console.error('Error updating data:', err.message);
      res.status(500).send({ message: 'Error updating data', error: err.message });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'No rows updated. Check your condition.' });
    } else {
      console.log('Data updated successfully');
      res.send({ message: 'Data updated successfully' });
    }
  });
});

// **DELETE data from a table**
app.delete('/delete', (req, res) => {
  const { tableName, condition } = req.body;
  const query = `DELETE FROM ${tableName} WHERE ${condition}`;

  db.run(query, function (err) {
    if (err) {
      console.error('Error deleting data:', err.message);
      res.status(500).send({ message: 'Error deleting data', error: err.message });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'No rows deleted. Check your condition.' });
    } else {
      console.log('Data deleted successfully');
      res.send({ message: 'Data deleted successfully' });
    }
  });
});

// **DELETE a table**
app.delete('/drop-table', (req, res) => {
  const { tableName } = req.body;
  const query = `DROP TABLE IF EXISTS ${tableName}`;

  db.run(query, (err) => {
    if (err) {
      console.error('Error dropping table:', err.message);
      res.status(500).send({ message: 'Error dropping table', error: err.message });
    } else {
      console.log(`Table '${tableName}' dropped successfully.`);
      res.send({ message: `Table '${tableName}' dropped successfully.` });
    }
  });
});

// **VIEW all tables in the database**
app.get('/view-tables', (req, res) => {
  const query = "SELECT name FROM sqlite_master WHERE type='table';";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tables:', err.message);
      res.status(500).send({ message: 'Error fetching tables', error: err.message });
    } else {
      const tableNames = rows.map(row => row.name);
      res.json({ tables: tableNames });
    }
  });
});

// Export app as a serverless function for Vercel
module.exports = app;
