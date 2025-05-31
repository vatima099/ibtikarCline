import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import fs from "fs";
import path from "path";
import clientPromise from "@/lib/mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Enhanced file type validation for document management
const CATEGORY_FILE_TYPES = {
  screenshots: [".jpg", ".jpeg", ".png", ".gif"],
  completionCertificate: [".pdf", ".doc", ".docx"],
  otherDocuments: [
    ".pdf",
    ".doc",
    ".docx",
    ".xlsx",
    ".xls",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
  ],
};

const DEFAULT_ALLOWED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xlsx",
  ".xls",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Create uploads directory structure
    const uploadsDir = path.join(process.cwd(), "uploads");
    const documentsDir = path.join(uploadsDir, "documents");
    const screenshotsDir = path.join(documentsDir, "screenshots");
    const certificatesDir = path.join(documentsDir, "certificates");
    const otherDir = path.join(documentsDir, "other");

    // Ensure directories exist
    [
      uploadsDir,
      documentsDir,
      screenshotsDir,
      certificatesDir,
      otherDir,
    ].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
    });

    const [fields, files] = await form.parse(req);

    if (!files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Handle single file or array of files
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const uploadedFiles = [];

    for (const file of fileArray) {
      if (!file.originalFilename) {
        continue;
      }

      const fileExtension = path.extname(file.originalFilename).toLowerCase();
      const category = fields.category?.[0] || "otherDocuments";
      const referenceId = fields.referenceId?.[0];

      // Validate file type based on category
      const allowedTypes =
        CATEGORY_FILE_TYPES[category as keyof typeof CATEGORY_FILE_TYPES] ||
        DEFAULT_ALLOWED_TYPES;

      if (!allowedTypes.includes(fileExtension)) {
        // Clean up uploaded file
        fs.unlinkSync(file.filepath);
        return res.status(400).json({
          error: `File type ${fileExtension} not allowed for ${category}. Allowed types: ${allowedTypes.join(
            ", "
          )}`,
        });
      }

      // Determine destination directory based on category
      let destDir = otherDir;
      if (category === "screenshots") {
        destDir = screenshotsDir;
      } else if (category === "completionCertificate") {
        destDir = certificatesDir;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}${fileExtension}`;
      const finalPath = path.join(destDir, fileName);

      // Move file to appropriate directory
      fs.renameSync(file.filepath, finalPath);

      // Create document record
      const documentRecord = {
        id: `${timestamp}_${randomString}`,
        originalName: file.originalFilename,
        fileName: fileName,
        size: file.size,
        type: file.mimetype || "application/octet-stream",
        category,
        uploadDate: new Date(),
        uploadedBy: session.user?.email,
        referenceId: referenceId || null,
        filePath: finalPath,
        relativePath: path.relative(process.cwd(), finalPath),
        url: `/uploads/documents/${
          category === "screenshots"
            ? "screenshots"
            : category === "completionCertificate"
            ? "certificates"
            : "other"
        }/${fileName}`,
      };

      // Store document metadata in database
      if (referenceId) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection("documents").insertOne(documentRecord);
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue without database storage for now
        }
      }

      uploadedFiles.push({
        id: documentRecord.id,
        filename: file.originalFilename,
        filepath: documentRecord.url,
        size: file.size,
        type: file.mimetype,
        category,
        url: documentRecord.url,
      });
    }

    if (uploadedFiles.length === 1) {
      return res.status(200).json({
        success: true,
        ...uploadedFiles[0],
      });
    } else {
      return res.status(200).json({
        success: true,
        files: uploadedFiles,
        count: uploadedFiles.length,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
