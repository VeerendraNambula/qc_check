
const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Standalone static server listening at http://localhost:${port}`);
});
