// Login_Backend/server.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.0/mod.ts";
import { validateUser, editPass } from "./loginAuth.ts";
import { makeAcc } from "./newAcc.ts";
import { updateProfile } from "./updateProfile.ts"; // New import

const client = await new Client().connect({
    hostname: "localhost",
    username: "root",
    db: "student_db",
    password: "avi691610"
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: new Headers(corsHeaders) });
    }

    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/login') {
        try {
            const { username, password } = await req.json();
            const Data = await validateUser(client, username, password);
            const headers = new Headers(corsHeaders);
            headers.set('Content-Type', 'application/json');
            return new Response(JSON.stringify(Data.data), { headers, status: Data.status });
        } catch (error) {
            return new Response(JSON.stringify({ message: "Server error during login" }), { status: 500 });
        }
    }

    if (req.method === 'POST' && url.pathname === '/edit') {
        try {
            const {username, password, npass} = await req.json();
            const Data = await editPass(client, username, password, npass);
            const headers = new Headers(corsHeaders);
            headers.set('Content-Type', 'application/json');
            return new Response(JSON.stringify(Data.data), { headers, status: Data.status });
        } catch (error) {
            return new Response(JSON.stringify({ message: "Failed to update password" }), { status: 500 });
        }
    }

    if (req.method === 'POST' && url.pathname === '/createAcc') {
        try {
            const {name,username,dob, password} = await req.json();
            const Data = await makeAcc(client,name,username,dob, password);
            const headers = new Headers(corsHeaders);
            headers.set('Content-Type', 'application/json');
            return new Response(JSON.stringify(Data.data), { headers, status: Data.status });
        } catch (error) {
            return new Response(JSON.stringify({ message: "Failed to create account" }), { status: 500 });
        }
    }
    
    // --- THIS IS THE NEW PART WE ARE ADDING ---
    if (req.method === 'POST' && url.pathname === '/update-profile') {
        try {
            const { 
              uid, email, phone, location, bio, occupation, avatar_data, interests 
            } = await req.json();
            
            const Data = await updateProfile(client, uid, email, phone, location, bio, occupation, avatar_data, interests);
            
            const headers = new Headers(corsHeaders);
            headers.set('Content-Type', 'application/json');
            return new Response(JSON.stringify(Data.data), { headers, status: Data.status });
        } catch (error) {
            console.error("Update profile error:", error);
            return new Response(JSON.stringify({ message: "Failed to update profile" }), { status: 500 });
        }
    }
    // --- END OF NEW PART ---

    return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
};

console.log("Authentication server running on http://localhost:8000");
serve(handler, { port: 8000 });