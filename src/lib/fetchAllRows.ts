// Supabase returns at most 1,000 rows per request. Reports that need every
// matching row (not a window) page through with this instead of assuming
// one request is enough (usage audit, 2026-11-18). The query must have a
// stable order (add .order('id') as a tiebreaker).
const PAGE = 1000;

type PageResult<T> = { data: T[] | null; error: { message: string } | null };

export async function fetchAllRows<T>(page: (from: number, to: number) => PromiseLike<PageResult<T>>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}
