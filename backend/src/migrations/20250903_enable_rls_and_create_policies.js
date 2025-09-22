const tables = ['product_photos', 'users', 'categories', 'products', 'sellers', 'reviews', 'product_history', 'favorites'];

module.exports = {
  up: async ({ context: queryInterface }) => {
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Only authenticated users can select ${table}"
            ON public.${table}
            FOR SELECT
            TO authenticated
            USING (true);

        CREATE POLICY "Only authenticated users can insert ${table}"
            ON public.${table}
            FOR INSERT
            TO authenticated
            WITH CHECK (true);

        CREATE POLICY"Only authenticated users can update ${table}"
            ON public.${table}
            FOR UPDATE
            TO authenticated
            USING (true);
              
        CREATE POLICY "Only authenticated users can delete ${table}"
            ON public.${table}
            FOR DELETE
            TO authenticated
            USING (true);
      `);
    }
  },
  down: async ({ context: queryInterface }) => {
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP POLICY IF EXISTS "Only authenticated users can select ${table}" ON public.${table};
        DROP POLICY IF EXISTS "Only authenticated users can insert ${table}" ON public.${table};
        DROP POLICY IF EXISTS "Only authenticated users can update ${table}" ON public.${table};
        DROP POLICY IF EXISTS "Only authenticated users can delete ${table}" ON public.${table};
        ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;
      `);
    }
  }
}