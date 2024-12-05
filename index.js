const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// **CREATE a table**
app.post('/create-table', (req, res) => {
  const { tableName, columns } = req.body; // Example: { tableName: "users", columns: "id INTEGER PRIMARY KEY, name TEXT, email TEXT" }
  const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

  db.run(query, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error creating table', error: err.message });
    } else {
      res.send({ message: `Table '${tableName}' created successfully.` });
    }
  });
});

// **INSERT data into a table**
app.post('/insert', (req, res) => {
  const { tableName, values } = req.body; // Example: { tableName: "users", values: "(1, 'Evin', 'evin@example.com')" }
  const query = `INSERT INTO ${tableName} VALUES ${values}`;

  db.run(query, function (err) {
    if (err) {
      res.status(500).send({ message: 'Error inserting data', error: err.message });
    } else {
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
      res.status(500).send({ message: 'Error reading data', error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// **UPDATE data in a table**
app.put('/update', (req, res) => {
  const { tableName, updates, condition } = req.body; // Example: { tableName: "users", updates: "name = 'Thomas'", condition: "id = 1" }
  const query = `UPDATE ${tableName} SET ${updates} WHERE ${condition}`;

  db.run(query, function (err) {
    if (err) {
      res.status(500).send({ message: 'Error updating data', error: err.message });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'No rows updated. Check your condition.' });
    } else {
      res.send({ message: 'Data updated successfully' });
    }
  });
});

// **DELETE data from a table**
app.delete('/delete', (req, res) => {
  const { tableName, condition } = req.body; // Example: { tableName: "users", condition: "id = 1" }
  const query = `DELETE FROM ${tableName} WHERE ${condition}`;

  db.run(query, function (err) {
    if (err) {
      res.status(500).send({ message: 'Error deleting data', error: err.message });
    } else if (this.changes === 0) {
      res.status(404).send({ message: 'No rows deleted. Check your condition.' });
    } else {
      res.send({ message: 'Data deleted successfully' });
    }
  });
});

// **DELETE a table**
app.delete('/drop-table', (req, res) => {
  const { tableName } = req.body; // Example: { tableName: "users" }
  const query = `DROP TABLE IF EXISTS ${tableName}`;

  db.run(query, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error dropping table', error: err.message });
    } else {
      res.send({ message: `Table '${tableName}' deleted successfully.` });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
