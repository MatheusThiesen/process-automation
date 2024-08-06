import { Pool } from "pg";

class DbPortal {
  private pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.PORTAL_POSTGRES_CONNECTION,
    });
  }

  public async $ExecuteQuery<T>(query: string): Promise<T[]> {
    try {
      await this.pool.connect();

      const rows = await this.pool.query(query);

      return rows.rows;
    } catch (err) {
      console.log(query);
      console.log(err);

      return [];
    }
    // finally {
    // if (this.pool) this.pool.end().then();
    // }
  }
}

export const dbPortal = new DbPortal();
