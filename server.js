
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Config endpoint to provide frontend with PUBLIC keys (be careful - this exposes them)
app.get('/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_KEY || ''
    });
});

// Proxy create-folder to your n8n webhook
app.post('/api/create-folder', async (req, res) => {
    const target = process.env.N8N_CREATE_FOLDER_WEBHOOK;
    if (!target) return res.status(500).json({ error: 'N8N_CREATE_FOLDER_WEBHOOK not configured' });
    try {
        const r = await fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json().catch(() => ({ status: r.status }));
        if (!r.ok) return res.status(r.status).json(data);
        res.json(data);
    } catch (err) {
        console.error('proxy create-folder err', err);
        res.status(500).json({ error: err.message });
    }
});

// Proxy send-to-n8n / lambda for combination processing
app.post('/api/send-n8n', async (req, res) => {
    const target = process.env.N8N_COMBINE_WEBHOOK;
    if (!target) return res.status(500).json({ error: 'N8N_COMBINE_WEBHOOK not configured' });
    try {
        const r = await fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json().catch(() => ({ status: r.status }));
        if (!r.ok) return res.status(r.status).json(data);
        res.json(data);
    } catch (err) {
        console.error('proxy send-n8n err', err);
        res.status(500).json({ error: err.message });
    }
});

// Proxy retry google drive (to your configured endpoint)
app.post('/api/retry-google-drive', async (req, res) => {
    const target = process.env.RETRY_GOOGLE_DRIVE_ENDPOINT;
    if (!target) return res.status(500).json({ error: 'RETRY_GOOGLE_DRIVE_ENDPOINT not configured' });
    try {
        const r = await fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json().catch(() => ({ status: r.status }));
        if (!r.ok) return res.status(r.status).json(data);
        res.json(data);
    } catch (err) {
        console.error('proxy retry err', err);
        res.status(500).json({ error: err.message });
    }
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
