import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Security check - only allow in development or with a special secret
  const isProduction = process.env.NODE_ENV === "production";
  const adminSecret = req.headers["x-admin-secret"];

  if (isProduction && adminSecret !== process.env.ADMIN_CREATION_SECRET) {
    return res.status(403).json({
      message:
        "Forbidden. Admin creation not allowed in production without secret.",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Admin user details
    const adminEmail = "admin@ibtikartech.com";
    const adminPassword = "admin123456"; // Change this to a secure password
    const adminName = "System Administrator";

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
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

      return res.status(200).json({
        message: "Admin user already exists and has been updated to admin role",
        credentials: {
          email: adminEmail,
          password: adminPassword,
          role: "admin",
        },
      });
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

      return res.status(201).json({
        message: "Admin user created successfully",
        userId: result.insertedId,
        credentials: {
          email: adminEmail,
          password: adminPassword,
          role: "admin",
        },
      });
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
