import { AppError } from 'common-common/src/errors';
import { Request, Response } from 'express';
import { DB } from '../models';

export async function createCommunityContractTemplate(
  models: DB,
  req: Request,
  res: Response
) {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide contract template',
      });
    }

    const { community_id, contract_id, template_id } = req.body.contract;
    if (!community_id || !contract_id || !template_id) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide community_id, contract_id, and template_id',
      });
    }

    const result = await models.sequelize.query(
      `INSERT INTO CommunityContractTemplate (
      community_id, 
      contract_id, 
      template_id
    ) VALUES (:community_id, :contract_id, template_id)`
    );

    return res.json({ status: 'Success', result });
  } catch (err) {
    throw new AppError('Error creating community contract template');
  }
}

export async function getCommunityContractTemplate(
  models: DB,
  req: Request,
  res: Response
) {
  try {
    const { community_id, contract_id } = req.body.contract;
    if (!community_id || !contract_id) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide community_id and contract_id',
      });
    }

    const result = await models.sequelize.query(
      `SELECT * FROM CommunityContractTemplate 
      WHERE community_id = :community_id AND contract_id = :contract_id`
    );

    return res.json({ status: 'Success', result });
  } catch (err) {
    throw new AppError('Error getting community contract template');
  }
}

export async function updateCommunityContractTemplate(
  models: DB,
  req: Request,
  res: Response
) {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide contract template',
      });
    }

    const { community_id, contract_id, template_id } = req.body.contract;
    if (!community_id || !contract_id || !template_id) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide community_id, contract_id, and template_id',
      });
    }

    const result = await models.sequelize.query(
      `UPDATE CommunityContractTemplate SET
      community_id = :community_id, 
      contract_id = :contract_id, 
      template_id = :template_id
      WHERE community_id = :community_id AND contract_id = :contract_id`
    );

    return res.json({ status: 'Success', result });
  } catch (err) {
    throw new AppError('Error updating community contract template');
  }
}

export async function deleteCommunityContractTemplate(
  models: DB,
  req: Request,
  res: Response
) {
  try {
    const { community_id, contract_id } = req.body.contract;
    if (!community_id || !contract_id) {
      return res.status(400).json({
        status: 'Failure',
        message: 'Must provide community_id and contract_id',
      });
    }

    const result = await models.sequelize.query(
      `DELETE FROM CommunityContractTemplate 
      WHERE community_id = :community_id AND contract_id = :contract_id`
    );

    return res.json({ status: 'Success', result });
  } catch (err) {
    throw new AppError('Error deleting community contract template');
  }
}
