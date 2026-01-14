export interface QueryParams {
  readonly q: string | null;
  readonly tags: string | null;
  readonly priority: string | null;
  readonly status: string | null;
  readonly view: string | null;
  readonly sort: string | null;
  readonly due: string | null;
}

export function createQueryParams(
  params: Partial<QueryParams> = {}
): QueryParams {
  return Object.freeze({
    q: params.q ?? null,
    tags: params.tags ?? null,
    priority: params.priority ?? null,
    status: params.status ?? null,
    view: params.view ?? null,
    sort: params.sort ?? null,
    due: params.due ?? null,
  });
}

/**
 * Parse query params from a record (e.g., from framework router)
 */
export function parseFromRecord(
  record: Record<string, string | undefined>
): QueryParams {
  return createQueryParams({
    q: record["q"] ?? null,
    tags: record["tags"] ?? null,
    priority: record["priority"] ?? null,
    status: record["status"] ?? null,
    view: record["view"] ?? null,
    sort: record["sort"] ?? null,
    due: record["due"] ?? null,
  });
}

/**
 * Convert QueryParams to a record (for framework router)
 */
export function toRecord(params: QueryParams): Record<string, string> {
  const result: Record<string, string> = {};

  if (params.q) result["q"] = params.q;
  if (params.tags) result["tags"] = params.tags;
  if (params.priority) result["priority"] = params.priority;
  if (params.status) result["status"] = params.status;
  if (params.view) result["view"] = params.view;
  if (params.sort) result["sort"] = params.sort;
  if (params.due) result["due"] = params.due;

  return result;
}
