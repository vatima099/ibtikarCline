import { router } from "../trpc";
import { referencesRouter } from "./references";
import { masterDataRouter } from "./masterData";
import { usersRouter } from "./users";
import { rolesRouter } from "./roles";

export const appRouter = router({
  references: referencesRouter,
  masterData: masterDataRouter,
  users: usersRouter,
  roles: rolesRouter,
});

export type AppRouter = typeof appRouter;
