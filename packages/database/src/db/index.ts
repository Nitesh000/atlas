import * as authSchema from "./auth-schema";
import * as appSchema from "./schema";

export const fullSchema = { ...authSchema, ...appSchema };
export { authSchema, appSchema };
