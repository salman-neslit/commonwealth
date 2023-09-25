import path from 'path';
import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';

export async function sequelizeMigrationUp(sequelize) {
  const umzug = new Umzug({
    migrations: {
      glob: ['*.js', { cwd: path.join(__dirname, '../../server/migrations') }],
      resolve: ({ name, path, context }) => {
        const migration = require(path || '');
        return {
          name,
          up: async () => migration.up(context, Sequelize),
          down: async () => migration.down(context, Sequelize),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: null,
  });

  await umzug.up();
}