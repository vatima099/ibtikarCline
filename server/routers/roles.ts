import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

// Role schema
const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

// Access rights schema
const accessRightSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  resource: z.string().min(1, "Resource is required"),
  permissions: z.array(z.string()).min(1, "At least one permission required"),
  active: z.boolean().default(true),
});

const rolesManagementRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const roles = await ctx.db
      .collection("roles")
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();

    return roles.map((role: any) => ({
      ...role,
      id: role._id.toString(),
    }));
  }),

  create: procedure.input(roleSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const role = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ctx.db.collection("roles").insertOne(role);

    return {
      ...role,
      id: result.insertedId.toString(),
    };
  }),

  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: roleSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("roles").updateOne(
        { _id: new ObjectId(input.id) },
        {
          $set: {
            ...input.data,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updatedRole = await ctx.db
        .collection("roles")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedRole,
        id: updatedRole!._id.toString(),
      };
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by setting active to false
      const result = await ctx.db.collection("roles").updateOne(
        { _id: new ObjectId(input.id) },
        {
          $set: {
            active: false,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { success: true };
    }),
});

const accessRightsRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const accessRights = await ctx.db
      .collection("accessRights")
      .find({ active: true })
      .sort({ createdAt: -1 })
      .toArray();

    return accessRights.map((right: any) => ({
      ...right,
      id: right._id.toString(),
    }));
  }),

  create: procedure
    .input(accessRightSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const accessRight = {
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await ctx.db
        .collection("accessRights")
        .insertOne(accessRight);

      return {
        ...accessRight,
        id: result.insertedId.toString(),
      };
    }),

  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: accessRightSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("accessRights").updateOne(
        { _id: new ObjectId(input.id) },
        {
          $set: {
            ...input.data,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updatedRight = await ctx.db
        .collection("accessRights")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedRight,
        id: updatedRight!._id.toString(),
      };
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by setting active to false
      const result = await ctx.db.collection("accessRights").updateOne(
        { _id: new ObjectId(input.id) },
        {
          $set: {
            active: false,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { success: true };
    }),

  getUserRights: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const rights = await ctx.db
        .collection("accessRights")
        .find({ userId: input.userId, active: true })
        .toArray();

      return rights.map((right: any) => ({
        ...right,
        id: right._id.toString(),
      }));
    }),
});

export const rolesRouter = router({
  roles: rolesManagementRouter,
  accessRights: accessRightsRouter,
});
