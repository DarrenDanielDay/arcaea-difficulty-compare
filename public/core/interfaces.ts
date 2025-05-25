export interface EntityFactory<T> {
  create(id: string): Promise<T>;
}

export interface EntityRenderer<T> {
  render(entity: T): JSX.Element;
}

export interface PublicInterfaces<T> {
  factory: EntityFactory<T>;
  renderer: EntityRenderer<T>;
}

export function impl<T>(factory: EntityFactory<T>, renderer: EntityRenderer<T>): PublicInterfaces<T> {
  return {
    factory,
    renderer,
  };
}
