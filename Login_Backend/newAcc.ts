// newAcc.ts

// The function name is now makeAcc (camelCase)
export async function makeAcc(client, name: string, uname: string, dob: string, pass: string) {
  const results = await client.query(
    `SELECT name FROM USERS WHERE uname = ?`,
    [uname]
  );

  if (results.length <= 0) {
    // The line calling corr_dob has been REMOVED.
    // dob is already in the correct 'YYYY-MM-DD' format from the frontend.

    const nuid = await client.query(
      `SELECT MAX(uid) AS max_uid FROM users;`
    );

    let uid: number = (nuid[0].max_uid || 1000) + 1;

    await client.query(
      `INSERT INTO users (uid, uname, name, password, dob) VALUES (?, ?, ?, ?, ?);`,
      [uid, uname, name, pass, dob]
    );

    return {
      status: 200,
      data: {
        message: "Account Added Succesfully",
        isValid: true,
        user: {
          name,
          uid,
          user: uname,
        },
      },
    };
  }

  return {
    status: 401,
    data: {
      message: "Cannot Create new account with same Username",
      isValid: false,
    },
  };
}

// The entire 'corr_dob' function has been REMOVED.