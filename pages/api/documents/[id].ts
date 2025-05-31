import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fs from "fs";
import path from "path";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid document ID" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    try {
      // Get document from database
      const client = await clientPromise;
      const db = client.db();

      const document = await db.collection("documents").findOne({ id });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check permissions - only admin, creator, or reference owner can delete
      const isAdmin = session.user?.role === "admin";
      const isOwner = document.uploadedBy === session.user?.email;

      if (!isAdmin && !isOwner) {
        // Check if user is responsible for the reference
        if (document.referenceId) {
          const reference = await db.collection("references").findOne({
            _id: document.referenceId,
          });

          if (!reference || reference.responsible !== session.user?.email) {
            return res
              .status(403)
              .json({
                error:
                  "Forbidden: You don't have permission to delete this document",
              });
          }
        } else {
          return res
            .status(403)
            .json({
              error:
                "Forbidden: You don't have permission to delete this document",
            });
        }
      }

      // Delete physical file
      try {
        if (document.filePath && fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath);
        }
      } catch (fileError) {
        console.error("Error deleting physical file:", fileError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      const result = await db.collection("documents").deleteOne({ id });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ error: "Document not found in database" });
      }

      return res.status(200).json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "GET") {
    // Get document metadata
    try {
      const client = await clientPromise;
      const db = client.db();

      const document = await db.collection("documents").findOne({ id });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check permissions for viewing
      const isAdmin = session.user?.role === "admin";
      const isOwner = document.uploadedBy === session.user?.email;

      if (!isAdmin && !isOwner) {
        // Check if user has access to the reference
        if (document.referenceId) {
          const reference = await db.collection("references").findOne({
            _id: document.referenceId,
          });

          if (!reference) {
            return res
              .status(404)
              .json({ error: "Associated reference not found" });
          }

          // Check if user can view this reference
          const canView =
            reference.status === "Completed" ||
            reference.responsible === session.user?.email ||
            reference.createdBy === session.user?.email;

          if (!canView) {
            return res
              .status(403)
              .json({
                error:
                  "Forbidden: You don't have permission to view this document",
              });
          }
        } else {
          return res
            .status(403)
            .json({
              error:
                "Forbidden: You don't have permission to view this document",
            });
        }
      }

      return res.status(200).json({
        id: document.id,
        originalName: document.originalName,
        fileName: document.fileName,
        size: document.size,
        type: document.type,
        category: document.category,
        uploadDate: document.uploadDate,
        uploadedBy: document.uploadedBy,
        referenceId: document.referenceId,
        url: document.url,
      });
    } catch (error) {
      console.error("Get document error:", error);
      return res.status(500).json({
        error: "Failed to retrieve document",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
