import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "user"]).default("user"),
  active: z.boolean().default(true),
  department: z.string().optional(),
  position: z.string().optional(),
});

const updateUserSchema = userSchema.partial();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const usersRouter = router({
  // Get all users (admin only)
  getAll: procedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        role: z.enum(["admin", "user"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { page, limit, search, role } = input;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (role) {
        query.role = role;
      }

      const [users, total] = await Promise.all([
        ctx.db
          .collection("users")
          .find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        ctx.db.collection("users").countDocuments(query),
      ]);

      return {
        users: users.map((user: any) => ({
          ...user,
          id: user._id.toString(),
          // Don't return sensitive fields
          password: undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Get user by ID
  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Users can only view their own profile, admins can view any
      if (
        ctx.session.user?.role !== "admin" &&
        input.id !== ctx.session.user?.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const user = await ctx.db.collection("users").findOne({
        _id: new ObjectId(input.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...user,
        id: user._id.toString(),
        password: undefined, // Don't return password
      };
    }),

  // Get current user profile
  getProfile: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await ctx.db.collection("users").findOne({
      email: ctx.session.user?.email,
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      ...user,
      id: user._id.toString(),
      password: undefined,
    };
  }),

  // Create new user (admin only)
  create: procedure
    .input(
      userSchema.extend({
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if user already exists
      const existingUser = await ctx.db
        .collection("users")
        .findOne({ email: input.email });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      const user = {
        ...input,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: new Date(), // Auto-verify admin created users
      };

      const result = await ctx.db.collection("users").insertOne(user);

      return {
        ...user,
        id: result.insertedId.toString(),
        password: undefined,
      };
    }),

  // Update user
  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: updateUserSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Users can only update their own profile (excluding role), admins can update any
      if (ctx.session.user?.role !== "admin") {
        if (input.id !== ctx.session.user?.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Remove role from update data for non-admin users
        delete input.data.role;
      }

      const result = await ctx.db.collection("users").updateOne(
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

      const updatedUser = await ctx.db
        .collection("users")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedUser,
        id: updatedUser!._id.toString(),
        password: undefined,
      };
    }),

  // Change password
  changePassword: procedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await ctx.db.collection("users").findOne({
        email: ctx.session.user?.email,
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        input.currentPassword,
        user.password
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      );

      return { success: true };
    }),

  // Reset password (admin only)
  resetPassword: procedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      const result = await ctx.db.collection("users").updateOne(
        { _id: new ObjectId(input.userId) },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { success: true };
    }),

  // Deactivate user (admin only)
  deactivate: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Prevent admin from deactivating themselves
      if (input.id === ctx.session.user?.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot deactivate your own account",
        });
      }

      const result = await ctx.db.collection("users").updateOne(
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

  // Activate user (admin only)
  activate: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("users").updateOne(
        { _id: new ObjectId(input.id) },
        {
          $set: {
            active: true,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { success: true };
    }),

  // Get user statistics (admin only)
  getStats: procedure.query(async ({ ctx }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const [totalUsers, activeUsers, adminUsers] = await Promise.all([
      ctx.db.collection("users").countDocuments({}),
      ctx.db.collection("users").countDocuments({ active: true }),
      ctx.db.collection("users").countDocuments({ role: "admin" }),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers: activeUsers - adminUsers,
    };
  }),
});
