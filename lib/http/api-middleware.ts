import type { AuthSnapshot } from "@/app/shared/lib/auth/types";
import type { Permission } from "@/app/shared/lib/permissions";
import { requireAnyPermission, requireAuth, requirePermission } from "@/lib/auth/authorization";
import type { BillingFeature, BillingResource } from "@/lib/billing/constants";
import { assertPlanFeature, assertPlanResourceAvailable } from "@/lib/billing/guards";
import { errorResponse } from "./api-error";

type ApiMiddlewareOptions = {
  permission?: Permission;
  anyPermissions?: readonly Permission[];
  feature?: BillingFeature;
  resource?: { resource: BillingResource; amount?: number };
  context: string;
};

type ApiHandler<Context = unknown> = (request: Request, context: Context, auth: AuthSnapshot) => Promise<Response>;

export function withApiMiddleware<Context = unknown>(handler: ApiHandler<Context>, options: ApiMiddlewareOptions) {
  return async (request: Request, context: Context) => {
    try {
      const auth = options.anyPermissions?.length
        ? await requireAnyPermission(options.anyPermissions)
        : options.permission
          ? await requirePermission(options.permission)
          : await requireAuth();

      if (options.feature) await assertPlanFeature(auth.organization.id, options.feature);
      if (options.resource) await assertPlanResourceAvailable(auth.organization.id, options.resource.resource, options.resource.amount ?? 1);

      return handler(request, context, auth);
    } catch (error) {
      return errorResponse(error, options.context);
    }
  };
}