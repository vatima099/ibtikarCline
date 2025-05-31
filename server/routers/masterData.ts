import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

// Clients router
const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  country: z.string().optional(),
  active: z.boolean().default(true),
});

const clientsRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const clients = await ctx.db
      .collection("clients")
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();

    return clients.map((client: any) => ({
      ...client,
      id: client._id.toString(),
    }));
  }),

  create: procedure.input(clientSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const client = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ctx.db.collection("clients").insertOne(client);

    return {
      ...client,
      id: result.insertedId.toString(),
    };
  }),

  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: clientSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("clients").updateOne(
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

      const updatedClient = await ctx.db
        .collection("clients")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedClient,
        id: updatedClient!._id.toString(),
      };
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by setting active to false
      const result = await ctx.db.collection("clients").updateOne(
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

// Countries router
const countrySchema = z.object({
  name: z.string().min(1, "Country name is required"),
  code: z.string().min(2, "Country code is required").max(3),
  region: z.string().optional(),
  active: z.boolean().default(true),
});

const countriesRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const countries = await ctx.db
      .collection("countries")
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();

    return countries.map((country: any) => ({
      ...country,
      id: country._id.toString(),
    }));
  }),

  create: procedure.input(countrySchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const country = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ctx.db.collection("countries").insertOne(country);

    return {
      ...country,
      id: result.insertedId.toString(),
    };
  }),

  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: countrySchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("countries").updateOne(
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

      const updatedCountry = await ctx.db
        .collection("countries")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedCountry,
        id: updatedCountry!._id.toString(),
      };
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by setting active to false
      const result = await ctx.db.collection("countries").updateOne(
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

// Technologies router
const technologySchema = z.object({
  name: z.string().min(1, "Technology name is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  active: z.boolean().default(true),
});

const technologiesRouter = router({
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const technologies = await ctx.db
      .collection("technologies")
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();

    return technologies.map((tech: any) => ({
      ...tech,
      id: tech._id.toString(),
    }));
  }),

  create: procedure.input(technologySchema).mutation(async ({ ctx, input }) => {
    if (!ctx.session || ctx.session.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const technology = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ctx.db
      .collection("technologies")
      .insertOne(technology);

    return {
      ...technology,
      id: result.insertedId.toString(),
    };
  }),

  update: procedure
    .input(
      z.object({
        id: z.string(),
        data: technologySchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await ctx.db.collection("technologies").updateOne(
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

      const updatedTechnology = await ctx.db
        .collection("technologies")
        .findOne({ _id: new ObjectId(input.id) });

      return {
        ...updatedTechnology,
        id: updatedTechnology!._id.toString(),
      };
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || ctx.session.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by setting active to false
      const result = await ctx.db.collection("technologies").updateOne(
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

export const masterDataRouter = router({
  clients: clientsRouter,
  countries: countriesRouter,
  technologies: technologiesRouter,
});
