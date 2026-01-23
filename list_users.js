
async function listUsers() {
    try {
        console.log("Fetching users...");
        const res = await fetch('http://localhost:3000/users');
        if (!res.ok) {
            console.error("Failed to fetch:", res.status);
            return;
        }
        const users = await res.json();
        console.log("Users in DB:", JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
listUsers();
