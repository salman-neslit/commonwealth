'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('Threads', 'body_backup', {
        transaction,
      });
      await queryInterface.renameColumn('Threads', 'body', 'body_backup', {
        transaction,
      });
      await queryInterface.renameColumn('Threads', 'plaintext', 'body', {
        transaction,
      });

      // date filter since confirmed on previous execution of this query in
      // production that no older records exist -> significantly improves query
      // performance which is important to speed up the migration
      const encodedThreads = await queryInterface.sequelize.query(
        `
        SELECT id, body
        FROM "Threads"
        WHERE body_backup = body AND body ~ '%[0-9A-Fa-f]{2}' AND created_at > '2024-09-09';
      `,
        { transaction, type: QueryTypes.SELECT },
      );

      if (encodedThreads.length > 0) {
        let query = ``;
        const replacements = [];
        for (const thread of encodedThreads) {
          if (replacements.length > 0) query += ',\n';
          try {
            const decodedBody = decodeURIComponent(thread.body);
            query += 'WHEN id = ? THEN ?';
            replacements.push([thread.id, decodedBody]);
          } catch (e) {
            query += 'WHEN id = ? THEN ?';
            replacements.push([thread.id, thread.body]);
          }
        }

        await queryInterface.sequelize.query(
          `
          UPDATE "Threads"
          SET body = CASE
                          ${query}
                      END
          WHERE body_backup = body AND body ~ '%[0-9A-Fa-f]{2}';
      `,
          { transaction, replacements },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn('Threads', 'body', 'plaintext', {
        transaction,
      });
      await queryInterface.renameColumn('Threads', 'body_backup', 'body', {
        transaction,
      });
      await queryInterface.addColumn(
        'Threads',
        'body_backup',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
    });
  },
};
