export interface Tag {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
}

export function createTag(params: {
  id: number;
  slug: string;
  name: string;
}): Tag {
  return Object.freeze({
    id: params.id,
    slug: params.slug,
    name: params.name,
  });
}
