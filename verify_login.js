
async function verifyLogin() {
    const creds = [
        { userId: 'admin', password: 'password123' },
        { userId: 'user', password: 'password' },
        { userId: 'test-inspector', password: 'password123' }
    ];

    console.log("Verifying logins...");

    for (const c of creds) {
        try {
            console.log(`Trying ${c.userId}:${c.password}`);
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c)
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`SUCCESS! Logged in as ${data.username} (ID: ${data.userId})`);
                console.log("Token:", data.access_token.substring(0, 20) + "...");
            } else {
                console.log(`FAILED for ${c.userId}. Status: ${res.status}`);
                try {
                    const err = await res.json();
                    console.log("Error message:", err.message);
                } catch (e) {
                    console.log("No JSON error body");
                }
            }
        } catch (e) {
            console.error("Network/System Error:", e.message);
        }
        console.log("---");
    }
}

verifyLogin();
