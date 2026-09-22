import { getPool } from "./pool";

export async function updateSectionName(id: string, name: string): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query(
    `update sections set name = $2, updated_at = now() where id = $1`,
    [id, name]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function updateItemName(id: string, name: string): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query(
    `update items set name = $2, updated_at = now() where id = $1`,
    [id, name]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function updateCommentText(id: string, rawText: string): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query(
    `update comments set raw_text = $2, updated_at = now() where id = $1`,
    [id, rawText]
  );
  return (res.rowCount ?? 0) > 0;
}
