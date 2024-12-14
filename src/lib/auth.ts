import { Condition, Permission, ResourceType } from "@/types";
import { User } from "next-auth";

export const serverCheckPermission = async (
  user: Pick<User, "id" | "roles">,
  action: string,
  resource: string,
  targetResource?: ResourceType | null
): Promise<boolean> => {
  // You can add additional server-side checks here if needed
  return checkPermission(user, action, resource, targetResource);
};

export const checkPermission = (
  user: Pick<User, "id" | "roles">,
  action: string,
  resource: string,
  targetResource?: ResourceType | null
): boolean => {
  // Check if any role has the required permission
  const hasPermission =
    user.roles?.some((role) => {
      const permission = role.permissions.find(
        (p: Permission) => p.action === action && p.resource === resource
      );

      if (!permission) return false;

      // If no conditions, allow the action
      if (!permission.conditions || permission.conditions.length === 0)
        return true;

      // Check all conditions
      return permission.conditions.every((condition: Condition) =>
        checkCondition(user, targetResource ?? null, condition)
      );
    }) || false;

  return hasPermission;
};

const checkCondition = (
  user: Pick<User, "id" | "roles">,
  targetResource: ResourceType | null,
  condition: Condition
): boolean => {
  const { attribute, operator, value } = condition;

  // Special handling for user context
  const contextValue =
    attribute === "userId" ? user.id : targetResource?.[attribute];

  // Null/undefined checks
  if (contextValue === undefined || contextValue === null) {
    return false;
  }

  switch (operator) {
    case "eq":
      return contextValue === value;

    case "neq":
      return contextValue !== value;

    case "gt":
      return typeof contextValue === "number" && typeof value === "number"
        ? contextValue > value
        : false;

    case "gte":
      return typeof contextValue === "number" && typeof value === "number"
        ? contextValue >= value
        : false;

    case "lt":
      return typeof contextValue === "number" && typeof value === "number"
        ? contextValue < value
        : false;

    case "lte":
      return typeof contextValue === "number" && typeof value === "number"
        ? contextValue <= value
        : false;

    case "in":
      return Array.isArray(value) ? value.includes(contextValue) : false;

    case "nin":
      return Array.isArray(value) ? !value.includes(contextValue) : true;

    case "contains":
      if (typeof contextValue === "string" && typeof value === "string") {
        return contextValue.includes(value);
      }
      if (Array.isArray(contextValue)) {
        return contextValue.includes(value);
      }
      return false;

    case "startsWith":
      return typeof contextValue === "string" && typeof value === "string"
        ? contextValue.startsWith(value)
        : false;

    case "endsWith":
      return typeof contextValue === "string" && typeof value === "string"
        ? contextValue.endsWith(value)
        : false;

    case "matches":
      if (typeof contextValue === "string" && value instanceof RegExp) {
        return value.test(contextValue);
      }
      return false;

    default:
      console.warn(`Unsupported operator: ${operator}`);
      return false;
  }
};
