// --- THIS IS A TEMPORARY DEBUGGING VERSION ---
export async function validateUser(client, uname: string, pass: string) {
  console.log(`Attempting to validate user: ${uname}`); // For debugging

  // Temporarily, we only check if the username exists
  const results = await client.query(
    `SELECT uname, uid, name FROM USERS WHERE uname = ?`,
    [uname]
  );

  console.log(`Database query found ${results.length} results.`); // For debugging

  if (results.length > 0) {
    return {
      status: 200,
      data: {
        message: "Login Successful (DEBUG MODE)",
        isValid: true,
        user: {
          name: results[0].name,
          uid: results[0].uid,
          user: results[0].uname,
        },
      },
    };
  }
  return {
    status: 401,
    data: {
      message: "Invalid Credentials :/",
      isValid: false,
    },
  };
}

// The editPass function remains the same
export async function editPass(client, uname: string, pass: string, npass: string) {
  const results = await client.query(
    `SELECT uname, uid, name FROM USERS WHERE uname = ? AND password = ?`,
    [uname, pass]
  );
  if (results.length > 0) {
    await client.query(
      `UPDATE USERS SET password= ? WHERE uname = ? AND password = ?`,
      [npass, uname, pass]
    );
    return {
      status: 200,
      data: {
        message: "Password Changed Succesfully",
        isValid: true,
        user: {
          name: results[0].name,
          uid: results[0].uid,
          user: results[0].uname,
        },
      },
    };
  }
  return {
    status: 401,
    data: {
      message: "Invalid Credentials :/",
      isValid: false,
    },
  };
}