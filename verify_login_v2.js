
const fs = require('fs');

async function verifyLogin() {
    const creds = [
        { userId: 'admin', password: 'password123' },
        { userId: '1700', password: 'Damm@420' },
        { userId: 'test-inspector', password: 'password123' }
    ];

    let output = "Login Verification Results:\n";

    for (const c of creds) {
        try {
            output += `Trying ${c.userId}:${c.password}\n`;
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c)
            });

            output += `Status: ${res.status}\n`;
            if (res.ok) {
                const data = await res.json();
                output += `SUCCESS! Token: ${data.access_token.substring(0, 10)}...\n`;
            } else {
                try {
                    const err = await res.json();
                    output += `FAILED! Check: ${JSON.stringify(err)}\n`;
                } catch (e) {
                    output += `FAILED! No JSON body\n`;
                }
            }
        } catch (e) {
            output += `Network/System Error: ${e.message}\n`;
        }
        output += "---\n";
    }
    fs.writeFileSync('login_results.txt', output);
    console.log("Results written to login_results.txt");
}

verifyLogin();
