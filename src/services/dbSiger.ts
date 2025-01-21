import * as mariadb from "mariadb";

class DbSiger {
  private pool = mariadb.createPool({
    host: process.env.RECH_MARIADB_HOST,
    port: Number(process.env.RECH_MARIADB_PORT),
    user: process.env.RECH_MARIADB_USER,
    password: process.env.RECH_MARIADB_PASS,
    connectionLimit: 200,
  });

  public async $ExecuteQuery<T>(query: string): Promise<T[]> {
    let conn;

    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(query);

      return rows;
    } catch (err) {
      console.log(query);

      throw err;
    } finally {
      if (conn) conn.end().then();
    }
  }
}

export const dbSiger = new DbSiger();
