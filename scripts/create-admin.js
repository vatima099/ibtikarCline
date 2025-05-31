const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection URL - update this with your connection string if different
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name";

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Admin user details
    const adminEmail = "admin@ibtikartech.com";
    const adminPassword = "admin123456"; // Change this to a secure password
    const adminName = "System Administrator";

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists!");

      // Update existing user to admin role
      await usersCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            role: "admin",
            updatedAt: new Date(),
          },
        }
      );
      console.log("Updated existing user to admin role");
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create admin user
      const result = await usersCollection.insertOne({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Admin user created successfully!");
      console.log("User ID:", result.insertedId);
    }

    console.log("\n=== ADMIN LOGIN CREDENTIALS ===");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Role: admin");
    console.log("\nYou can now sign in with these credentials at /auth/signin");
    console.log(
      "\n⚠️  IMPORTANT: Change the admin password after first login!"
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the script
createAdminUser().catch(console.error);
