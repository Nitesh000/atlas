import * as authSchema from "./auth-schema.js";
import * as appSchema from "./schema.js";

export const fullSchema = { ...authSchema, ...appSchema };
