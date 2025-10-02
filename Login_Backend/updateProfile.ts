// Login_Backend/updateProfile.ts

export async function updateProfile(
  client: any, 
  uid: number, 
  email: string, 
  phone: string, 
  location: string,
  bio: string,
  occupation: string,
  avatar_data: string, 
  interests: string[]
) {
  
  const interestsJson = JSON.stringify(interests);

  await client.query(
    `UPDATE users 
     SET email = ?, phone = ?, location = ?, bio = ?, occupation = ?, avatar_data = ?, interests = ? 
     WHERE uid = ?;`,
    [email, phone, location, bio, occupation, avatar_data, interestsJson, uid]
  );
  
  const updatedUser = await client.query(
    `SELECT uid, uname, name, dob, email, phone, location, bio, occupation, avatar_data, interests FROM users WHERE uid = ?`,
    [uid]
  );

  const userResult = updatedUser[0];
  if (userResult && userResult.interests) {
    userResult.interests = JSON.parse(userResult.interests);
  }

  return {
    status: 200,
    data: {
      message: "Profile updated successfully",
      user: userResult
    },
  };
}