// Native fetch used in Node 18+

// Wrapper for fetch to handle Node environments without native fetch if necessary
// But assuming Node 18+, global fetch exists.
// Using generic approach.

async function verifyUpdate() {
    try {
        console.log("1. Fetching first user...");
        const usersRes = await fetch('http://localhost:3000/users');
        if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`);
        const users = await usersRes.json();

        if (users.length === 0) {
            console.log("No users found to test.");
            return;
        }

        const user = users[0];
        console.log(`Testing with user: ID=${user.id}, Name=${user.name}`);
        const originalName = user.name;
        const testName = "Updated Name Test";

        console.log(`2. Updating name to '${testName}'...`);
        const updateRes = await fetch(`http://localhost:3000/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: testName })
        });

        if (!updateRes.ok) {
            const text = await updateRes.text();
            throw new Error(`Update failed: ${updateRes.status} - ${text}`);
        }
        console.log("Update request successful.");

        console.log("3. Verifying update...");
        const verifyRes = await fetch(`http://localhost:3000/users/${user.id}`);
        const updatedUser = await verifyRes.json();
        console.log(`Current Name: ${updatedUser.name}`);

        if (updatedUser.name === testName) {
            console.log("SUCCESS: Name was updated correctly.");
        } else {
            console.error("FAILURE: Name was NOT updated.");
        }

        console.log("4. Reverting changes...");
        await fetch(`http://localhost:3000/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: originalName })
        });
        console.log("Reverted successfully.");

    } catch (e) {
        console.error("Error during verification:", e);
    }
}

verifyUpdate();
