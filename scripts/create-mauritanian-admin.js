const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection URL
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name";

async function createMauritanianAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Mauritanian admin user details
    const adminEmail = "admin1@taazour.mr";
    const adminPassword = "admin123456"; // Default password - should be changed after first login
    const adminName = "Administrator Taazour";

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Mauritanian admin user already exists!");

      // Update existing user to admin role
      await usersCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            role: "admin",
            active: true,
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

      console.log("Mauritanian admin user created successfully!");
      console.log("User ID:", result.insertedId);
    }

    console.log("\n=== MAURITANIAN ADMIN LOGIN CREDENTIALS ===");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Role: admin");
    console.log("\nYou can now sign in with these credentials at /auth/signin");
    console.log(
      "\n⚠️  IMPORTANT: Change the admin password after first login!"
    );
  } catch (error) {
    console.error("Error creating Mauritanian admin user:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the script
createMauritanianAdmin().catch(console.error);
