// server/index.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; 

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('Authentication failed: No token provided');
    return res.sendStatus(401); // No token
  }

  //console.log('Token received:', token);
  //console.log('JWT_SECRET used for verification:', JWT_SECRET);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403); // Invalid token
    }
    req.user = user; // Attach user payload to request
    next();
  });
};

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Images will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Temporary in-memory user storage


// MySQL connection (commented out for now to prevent connection errors)

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});


// Sample route
app.get('/', (req, res) => {
  res.send('Server running!');
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { name, username, password, designation } = req.body;

  if (!name || !username || !password || !designation) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const validDesignations = ['Pilot', 'Cabin crew', 'Ground Staff'];
  if (!validDesignations.includes(designation)) {
    return res.status(400).json({ error: 'Valid designation is required' });
  }

  // Check if username already exists in DB
  db.query('SELECT * FROM users WHERE login_id = ?', [username], async (err, results) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds = 10
      const sql = 'INSERT INTO users (name, login_id, password_hash, role, designation) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [name, username, hashedPassword, 'user', designation], (err, result) => {
        if (err) {
          console.error('Error inserting new user:', err);
          return res.status(500).json({ success: false, message: 'Server error during signup.' });
        }
        console.log('New user registered:', { id: result.insertId, name, login_id: username, role: 'user', designation });
        res.status(201).json({ success: true, message: 'User registered successfully!' });
      });
    } catch (error) {
      console.error('Error during password hashing:', error);
      res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
  });


});

// Login endpoint
app.post('/login', (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ success: false, message: 'Both login ID and password are required.' });
  }

  db.query('SELECT * FROM users WHERE login_id = ?', [login_id], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ success: false, message: 'Server error during login.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid login ID or password.' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid login ID or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, login_id: user.login_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.status(200).json({ success: true, message: 'Login successful!', token, user: { id: user.user_id, name: user.name, login_id: user.login_id, role: user.role } });
  });
});

// Endpoint to submit a new issue
app.post('/issues', upload.single('image'), (req, res) => {
  // user_id can be null for anonymous reporting
  let { user_id, issue_name, issue_site, location, latitude, longitude, date_time, timezone, issue_details } = req.body;
  const image_path = req.file ? `/uploads/${req.file.filename}` : null; // Get path of uploaded image

  // Convert user_id to null if it's an empty string or not a valid number
  user_id = (user_id === '' || isNaN(Number(user_id))) ? null : Number(user_id);

  // Basic validation
  if (!issue_name || !issue_site || !location || !date_time || !issue_details) {
    return res.status(400).json({ success: false, message: 'Missing required issue fields.' });
  }

  const sql = `INSERT INTO issues (
    user_id, issue_name, issue_site, location, latitude, longitude, date_time, timezone, issue_details, image_path
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    user_id,
    issue_name,
    issue_site,
    location,
    latitude,
    longitude,
    date_time,
    timezone,
    issue_details,
    image_path,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting new issue:', err);
      return res.status(500).json({ success: false, message: 'Server error when submitting issue.' });
    }
    res.status(201).json({ success: true, message: 'Issue submitted successfully!', issue_id: result.insertId });
  });
});

// Multer storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and ensure uniqueness
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const documentUpload = multer({ storage: documentStorage });

// Endpoint to submit a new document
app.post('/documents', authenticateToken, documentUpload.single('document_file_path'), (req, res) => {
  const user_id = req.user.user_id;
  const { document_name, issue_date, expiry_date } = req.body;
  const document_file_path = req.file ? `/uploads/${req.file.filename}` : null;

  if (!document_name || !issue_date) {
    return res.status(400).json({ success: false, message: 'Document name and issue date are required.' });
  }

  // Handle optional expiry_date. If it's an empty string, treat it as NULL.
  const final_expiry_date = expiry_date ? expiry_date : null;

  const sql = 'INSERT INTO documents (user_id, document_name, issue_date, expiry_date, document_file_path) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id, document_name, issue_date, final_expiry_date, document_file_path], (err, result) => {
    if (err) {
      console.error('Error inserting new document:', err);
      return res.status(500).json({ success: false, message: 'Server error when submitting document.' });
    }
    // Return the newly created document details
    const newDocumentId = result.insertId;
    db.query('SELECT * FROM documents WHERE document_id = ?', [newDocumentId], (err, newDoc) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Document saved, but failed to retrieve it.' });
        }
        res.status(201).json({ success: true, message: 'Document submitted successfully!', document: newDoc[0] });
    });
  });
});

// Endpoint to get documents for a logged-in user
app.get('/my-documents', authenticateToken, (req, res) => {
  const user_id = req.user.user_id;

  db.query('SELECT document_id, document_name, issue_date, expiry_date, document_file_path FROM documents WHERE user_id = ? ORDER BY issue_date DESC', [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching documents:', err);
      return res.status(500).json({ success: false, message: 'Server error fetching documents.' });
    }
    res.status(200).json({ success: true, documents: results });
  });
});

// Endpoint to get issues for a logged-in user
app.get('/my-issues', authenticateToken, (req, res) => {
  const user_id = req.user.user_id;

  db.query('SELECT * FROM issues WHERE user_id = ? ORDER BY date_time DESC', [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching issues:', err);
      return res.status(500).json({ success: false, message: 'Server error fetching issues.' });
    }
    res.status(200).json({ success: true, issues: results });
  });
});

// Endpoint to get all issues for admin
app.get('/admin/issues', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  const sql = `
    SELECT 
        i.issue_id, 
        i.issue_name, 
        i.issue_details, 
        i.image_path, 
        i.date_time, 
        i.status, 
        i.status_updated_at, 
        u.name AS reporter_username, 
        u.designation AS reporter_designation 
    FROM issues i 
    LEFT JOIN users u ON i.user_id = u.user_id 
    ORDER BY i.date_time DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching all issues for admin:', err);
      return res.status(500).json({ success: false, message: 'Server error fetching issues.' });
    }
    res.status(200).json({ success: true, issues: results });
  });
});

// Endpoint to delete a document
app.delete('/documents/:id', authenticateToken, (req, res) => {
    const document_id = req.params.id;
    const user_id = req.user.user_id;

    db.query('SELECT * FROM documents WHERE document_id = ? AND user_id = ?', [document_id, user_id], (err, results) => {
        if (err) {
            console.error('Error fetching document for deletion:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Document not found or permission denied.' });
        }

        const document = results[0];
        const filePath = document.document_file_path ? path.join(__dirname, 'uploads', path.basename(document.document_file_path)) : null;

        const deleteDbRecord = () => {
            db.query('DELETE FROM documents WHERE document_id = ?', [document_id], (dbErr) => {
                if (dbErr) {
                    console.error('Error deleting document from database:', dbErr);
                    return res.status(500).json({ success: false, message: 'Failed to delete document record.' });
                }
                res.status(200).json({ success: true, message: 'Document deleted successfully.' });
            });
        };

        if (filePath) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                    console.error('Error deleting physical file:', unlinkErr);
                    return res.status(500).json({ success: false, message: 'Failed to delete document file.' });
                }
                deleteDbRecord();
            });
        } else {
            deleteDbRecord();
        }
    });
});

// Endpoint for admin to delete an issue
app.delete('/admin/issues/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const issue_id = req.params.id;

    db.query('SELECT * FROM issues WHERE issue_id = ?', [issue_id], (err, results) => {
        if (err) {
            console.error('Error fetching issue for deletion:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Issue not found.' });
        }

        const issue = results[0];
        const imagePath = issue.image_path ? path.join(__dirname, path.basename(issue.image_path)) : null;

        const deleteDbRecord = () => {
            db.query('DELETE FROM issues WHERE issue_id = ?', [issue_id], (dbErr) => {
                if (dbErr) {
                    console.error('Error deleting issue from database:', dbErr);
                    return res.status(500).json({ success: false, message: 'Failed to delete issue record.' });
                }
                res.status(200).json({ success: true, message: 'Issue deleted successfully.' });
            });
        };

        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting image file:', unlinkErr);
                    // Decide if you should still delete the DB record. For now, we will.
                }
                deleteDbRecord();
            });
        } else {
            deleteDbRecord();
        }
    });
});

// Endpoint to update issue status to 'under process'
app.put('/admin/issues/:id/under-process', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const issue_id = req.params.id;

    const sql = `
        UPDATE issues 
        SET status = 'under process', status_updated_at = CURRENT_TIMESTAMP 
        WHERE issue_id = ?
    `;

    db.query(sql, [issue_id], (err, result) => {
        if (err) {
            console.error('Error updating issue status:', err);
            return res.status(500).json({ success: false, message: 'Server error updating issue status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Issue not found.' });
        }
        res.status(200).json({ success: true, message: 'Issue status updated to under process.' });
    });
});

// Endpoint to resolve an issue
app.post('/admin/issues/:id/resolve', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const issue_id = req.params.id;
    const { response } = req.body;

    if (!response) {
        return res.status(400).json({ success: false, message: 'Response is required.' });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        // Step 1: Copy the issue to resolved_issues
        const copySql = `
            INSERT INTO resolved_issues (issue_id, user_id, issue_name, issue_site, location, latitude, longitude, date_time, timezone, issue_details, image_path, status, status_updated_at, response)
            SELECT issue_id, user_id, issue_name, issue_site, location, latitude, longitude, date_time, timezone, issue_details, image_path, 'resolved', CURRENT_TIMESTAMP, ?
            FROM issues
            WHERE issue_id = ?
        `;

        db.query(copySql, [response, issue_id], (copyErr, result) => {
            if (copyErr) {
                console.error('Error copying issue to resolved_issues:', copyErr);
                return db.rollback(() => {
                    res.status(500).json({ success: false, message: 'Failed to resolve issue.' });
                });
            }

            if (result.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(404).json({ success: false, message: 'Issue not found.' });
                });
            }

            // Step 2: Delete the issue from the original table
            const deleteSql = 'DELETE FROM issues WHERE issue_id = ?';
            db.query(deleteSql, [issue_id], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting issue from issues table:', deleteErr);
                    return db.rollback(() => {
                        res.status(500).json({ success: false, message: 'Failed to remove resolved issue from active list.' });
                    });
                }

                db.commit(commitErr => {
                    if (commitErr) {
                        console.error('Error committing transaction:', commitErr);
                        return db.rollback(() => {
                            res.status(500).json({ success: false, message: 'Failed to finalize issue resolution.' });
                        });
                    }
                    res.status(200).json({ success: true, message: 'Issue resolved successfully.' });
                });
            });
        });
    });
});

// Endpoint to delete an issue
app.delete('/issues/:id', authenticateToken, (req, res) => {
    const issue_id = req.params.id;
    const user_id = req.user.user_id;

    db.query('SELECT * FROM issues WHERE issue_id = ? AND user_id = ?', [issue_id, user_id], (err, results) => {
        if (err) {
            console.error('Error fetching issue for deletion:', err);
            return res.status(500).json({ success: false, message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Issue not found or permission denied.' });
        }

        const issue = results[0];
        const imagePath = issue.image_path ? path.join(__dirname, 'uploads', path.basename(issue.image_path)) : null;

        const deleteDbRecord = () => {
            db.query('DELETE FROM issues WHERE issue_id = ?', [issue_id], (dbErr) => {
                if (dbErr) {
                    console.error('Error deleting issue from database:', dbErr);
                    return res.status(500).json({ success: false, message: 'Failed to delete issue record.' });
                }
                res.status(200).json({ success: true, message: 'Issue deleted successfully.' });
            });
        };

        if (imagePath) {
            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                    console.error('Error deleting image file:', unlinkErr);
                    return res.status(500).json({ success: false, message: 'Failed to delete issue image.' });
                }
                deleteDbRecord();
            });
        } else {
            deleteDbRecord();
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

