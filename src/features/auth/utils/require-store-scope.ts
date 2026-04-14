export function requireStoreScope(storeId: string | null | undefined): string {
  if (!storeId) {
    throw new Error('Store scope is not available yet. Select a store or wait for store bootstrap.')
  }

  return storeId
}
