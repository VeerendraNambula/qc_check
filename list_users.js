
const fs = require('fs');

async function listUsers() {
    try {
        const res = await fetch('http://localhost:3000/api/users');
        if (!res.ok) {
            fs.writeFileSync('users_dump.json', `Error: ${res.status} ${res.statusText}`);
            return;
        }
        const users = await res.json();
        fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
        console.log("Users dumped to users_dump.json");
    } catch (e) {
        fs.writeFileSync('users_dump.json', `Exception: ${e.message}`);
    }
}
listUsers();
