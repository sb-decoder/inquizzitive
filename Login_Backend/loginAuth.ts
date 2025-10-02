// Login_Backend/loginAuth.ts

import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";

export async function validateUser(client: any, uname: string, pass: string) {
    // A single, simple query to get all data for the user
    const users = await client.query(`SELECT * FROM users WHERE uname = ?`, [uname]);

    if (users.length === 0) {
        // User does not exist
        return {
            status: 401,
            data: { message: "Invalid username or password", isValid: false }
        };
    }

    const user = users[0];

    // Securely compare the provided password with the stored hash
    const passwordMatch = await compare(pass, user.password);

    if (passwordMatch) {
        // Password is correct, now prepare the user data to send back
        const { password, ...userToReturn } = user;

        // Parse interests if they exist
        if (userToReturn.interests) {
            try {
                userToReturn.interests = JSON.parse(userToReturn.interests);
            } catch (e) {
                userToReturn.interests = [];
            }
        }

        return {
            status: 200,
            data: { message: "Login successful", isValid: true, user: userToReturn }
        };
    } else {
        // Password does not match
        return {
            status: 401,
            data: { message: "Invalid username or password", isValid: false }
        };
    }
}

export async function editPass(client: any, uname: string, pass: string, npass: string) {
    const users = await client.query(`SELECT password FROM users WHERE uname = ?`, [uname]);
    if (users.length === 0) {
        return { status: 404, data: { message: "User not found", isValid: false } };
    }

    const passwordMatch = await compare(pass, users[0].password);

    if (!passwordMatch) {
        return { status: 401, data: { message: "Incorrect old password", isValid: false } };
    }

    const npassHash = await hash(npass);
    await client.query(`UPDATE users SET password = ? WHERE uname = ?`, [npassHash, uname]);
    return { status: 200, data: { message: "Password updated successfully", isValid: true } };
}