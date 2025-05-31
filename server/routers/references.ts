import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

const referenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  client: z.string().min(1, "Client is required"),
  country: z.string().min(1, "Country is required"),
  location: z.string().optional(),
  employeesInvolved: z
    .number()
    .int()
    .min(1, "Number of employees involved is required"),
  budget: z.string().optional(),
  status: z.enum(["En cours", "Completed"]),
  priority: z.enum(["High", "Medium", "Low"]),
  responsible: z.string().min(1, "Responsible person is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  keywords: z.array(z.string()).default([]),
  screenshots: z.array(z.string()).default([]),
  completionCertificate: z.string().optional(),
  otherDocuments: z.array(z.string()).default([]),
});

const referenceUpdateSchema = referenceSchema.partial();

const searchFiltersSchema = z.object({
  query: z.string().optional(),
  client: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["En cours", "Completed"]).optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  responsible: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const referencesRouter = router({
  // Get all references with filtering and pagination
  getAll: procedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        filters: searchFiltersSchema.optional(),
        sortBy: z.string().default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { page, limit, filters, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      // Build filter query
      const query: any = {};

      // Check if user is admin - if not, only show completed references or their own
      if (ctx.session.user?.role !== "admin") {
        query.$or = [
          { status: "Completed" },
          { responsible: ctx.session.user?.email },
        ];
      }

      if (filters) {
        if (filters.query) {
          query.$or = [
            ...(query.$or || []),
            { title: { $regex: filters.query, $options: "i" } },
            { description: { $regex: filters.query, $options: "i" } },
            { client: { $regex: filters.query, $options: "i" } },
            { keywords: { $in: [new RegExp(filters.query, "i")] } },
          ];
        }
        if (filters.client) query.client = filters.client;
        if (filters.country) query.country = filters.country;
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.responsible) query.responsible = filters.responsible;
        if (filters.technologies && filters.technologies.length > 0) {
          query.technologies = { $in: filters.technologies };
        }
        if (filters.startDate) {
          query.startDate = { $gte: filters.startDate };
        }
        if (filters.endDate) {
          query.endDate = { $lte: filters.endDate };
        }
      }

      const [references, total] = await Promise.all([
        ctx.db
          .collection("references")
          .find(query)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        ctx.db.collection("references").countDocuments(query),
      ]);

      return {
        references: references.map((ref: any) => ({
          ...ref,
          id: ref._id.toString(),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Get reference by ID
  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const reference = await ctx.db.collection("references").findOne({
        _id: new ObjectId(input.id),
      });

      if (!reference) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check permissions - only admin or responsible person can view non-completed references
      if (
        ctx.session.user?.role !== "admin" &&
        reference.status !== "Completed" &&
        reference.responsible !== ctx.session.user?.email
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        ...reference,
        id: reference._id.toString(),
      };
    }),

  // Create new reference
  create: procedure.input(referenceSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const reference = {
      ...input,
      createdBy: ctx.session.user?.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ctx.db.collection("references").insertOne(reference);

    return {
      ...reference,
      id: result.insertedId.toString(),
    };
  }),

  // Update reference
  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: referenceUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if user has permission to update this reference
      const existingReference = await ctx.db.collection("references").findOne({
        _id: new ObjectId(input.id),
      });

      if (!existingReference) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        ctx.session.user?.role !== "admin" &&
        existingReference.responsible !== ctx.session.user?.email &&
        existingReference.createdBy !== ctx.session.user?.email
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("references").updateOne(
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

      const updatedReference = await ctx.db
        .collection("references")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedReference,
        id: updatedReference!._id.toString(),
      };
    }),

  // Delete reference
  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if user has permission to delete this reference
      const existingReference = await ctx.db.collection("references").findOne({
        _id: new ObjectId(input.id),
      });

      if (!existingReference) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        ctx.session.user?.role !== "admin" &&
        existingReference.responsible !== ctx.session.user?.email &&
        existingReference.createdBy !== ctx.session.user?.email
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("references").deleteOne({
        _id: new ObjectId(input.id),
      });

      if (result.deletedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { success: true };
    }),

  // Search references
  search: procedure
    .input(searchFiltersSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const query: any = {};

      // Check permissions
      if (ctx.session.user?.role !== "admin") {
        query.$or = [
          { status: "Completed" },
          { responsible: ctx.session.user?.email },
        ];
      }

      if (input.query) {
        const searchRegex = { $regex: input.query, $options: "i" };
        query.$and = [
          ...(query.$and || []),
          {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { client: searchRegex },
              { keywords: searchRegex },
              { technologies: searchRegex },
            ],
          },
        ];
      }

      const references = await ctx.db
        .collection("references")
        .find(query)
        .sort({ updatedAt: -1 })
        .toArray();

      return references.map((ref: any) => ({
        ...ref,
        id: ref._id.toString(),
      }));
    }),

  // Get statistics for dashboard
  getStats: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const query: any = {};
    if (ctx.session.user?.role !== "admin") {
      query.$or = [
        { status: "Completed" },
        { responsible: ctx.session.user?.email },
      ];
    }

    const [
      totalReferences,
      completedReferences,
      ongoingReferences,
      highPriorityReferences,
    ] = await Promise.all([
      ctx.db.collection("references").countDocuments(query),
      ctx.db
        .collection("references")
        .countDocuments({ ...query, status: "Completed" }),
      ctx.db
        .collection("references")
        .countDocuments({ ...query, status: "En cours" }),
      ctx.db
        .collection("references")
        .countDocuments({ ...query, priority: "High" }),
    ]);

    return {
      totalReferences,
      completedReferences,
      ongoingReferences,
      highPriorityReferences,
    };
  }),

  // Get unique values for filters
  getFilterOptions: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const query: any = {};
    if (ctx.session.user?.role !== "admin") {
      query.$or = [
        { status: "Completed" },
        { responsible: ctx.session.user?.email },
      ];
    }

    const [clients, countries, technologies, responsiblePersons] =
      await Promise.all([
        ctx.db.collection("references").distinct("client", query),
        ctx.db.collection("references").distinct("country", query),
        ctx.db.collection("references").distinct("technologies", query),
        ctx.db.collection("references").distinct("responsible", query),
      ]);

    return {
      clients: clients.sort(),
      countries: countries.sort(),
      technologies: technologies.sort(),
      responsiblePersons: responsiblePersons.sort(),
    };
  }),
});
