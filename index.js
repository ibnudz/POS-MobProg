const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const midtransClient = require('midtrans-client');

const app = express();
const port = 3000;
const SECRET_KEY = 'SuperSecretAdminBrowser';

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_posmobprog',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware untuk memverifikasi token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Invalid token' });
    }

    req.user = user; // Menyimpan data user dari token ke `req.user`
    next();
  });
};

// Routes
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).send({ message: 'Database insert error', error: err });
      }
      res.send({ success: true, message: 'Registration successful' });
    });
  } catch (error) {
    res.status(500).send({ message: 'Error hashing password', error });
  }
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Database query error', error: err });
    }

    if (results.length === 0) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ success: true, token, message: 'Login successful' });
  });
});


app.get('/user-profile', authenticateToken, (req, res) => {
  const userId = req.user.id; // Ambil user ID dari token

  const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Database query error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    const user = {
      id: results[0].id,
      name: results[0].name,
      email: results[0].email,
      memberSince: results[0].created_at,
    };

    res.json(user);
  });
});

app.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});


app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products.');
    }
    res.json(results);
  });
});

app.post('/products', (req, res) => {
  const { name, price } = req.body;
  const query = 'INSERT INTO products (name, price, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
  db.query(query, [name, price], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).send('Error adding product.');
    }
    res.json({ id: result.insertId, name, price });
  });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, updated_at = NOW() WHERE id = ?';
  db.query(query, [name, price, id], (err) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).send('Error updating product.');
    }
    res.send('Product updated successfully.');
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Error deleting product.');
    }
    res.send('Product deleted successfully.');
  });
});

// Endpoint untuk membuat transaksi baru
app.post('/create-transaction', async (req, res) => {
  const { userId, productId, amount } = req.body;

  // Validasi input
  if (!userId || !productId || !amount) {
    return res.status(400).json({ error: 'All fields are required: userId, productId, amount.' });
  }

  const userQuery = 'SELECT email FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user.');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found.');
    }

    const email = results[0].email;

    try {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: '', //ganti server key midtrans
      });

      const orderId = `order-${Date.now()}`;

      const transactionParams = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        item_details: [
          {
            id: productId,
            price: amount,
            quantity: 1,
            name: `Product ${productId}`,
          },
        ],
        customer_details: {
          email: email,
        },
      };

      // Membuat transaksi di Midtrans
      const transaction = await snap.createTransaction(transactionParams);

      // Simpan transaksi ke database
      const query = `
        INSERT INTO transactions (user_id, total_amount, payment_status, created_at, updated_at)
        VALUES (?, ?, 'pending', NOW(), NOW())
      `;
      db.query(query, [userId, amount], (err) => {
        if (err) {
          console.error('Error saving transaction:', err);
          return res.status(500).json({ error: 'Error saving transaction.' });
        }

        // Kirim token dan URL redirect ke frontend
        res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Error creating transaction.' });
    }
  });
});

// Endpoint untuk mendapatkan transaksi berdasarkan user_id
app.get('/transactions', (req, res) => {
  const userId = req.session.user_id; // Pastikan user_id disimpan di session saat login

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User not logged in' });
  }

  const query = `
    SELECT 
      id, 
      user_id, 
      total_amount, 
      payment_status, 
      created_at, 
      updated_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});

// Endpoint untuk menerima notifikasi dari Midtrans
app.post('/transaction-notification', async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;

    if (!order_id || !transaction_status) {
      return res.status(400).json({ error: 'Order ID and status are required.' });
    }

    // Tentukan status pembayaran berdasarkan notifikasi dari Midtrans
    let paymentStatus;
    switch (transaction_status) {
      case 'settlement':
        paymentStatus = 'paid';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Perbarui status transaksi di database
    const updateQuery = `
      UPDATE transactions
      SET payment_status = ?
      WHERE id = (SELECT id FROM transactions WHERE total_amount = ? AND order_id = ?)
    `;
    db.query(updateQuery, [paymentStatus, order_id], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update transaction.' });
      }

      res.json({ message: 'Transaction updated successfully.' });
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});