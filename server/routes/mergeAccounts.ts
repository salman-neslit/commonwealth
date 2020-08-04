import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { factory, formatFilename } from '../../shared/logging';
import role from '../models/role';
const log = factory.getLogger(formatFilename(__filename));

export const Errors = {
    AddressesNotOwned: 'User does not own both addresses',
};

const mergeAccounts = async (models, req: Request, res: Response, next: NextFunction) => {
    const { oldAddress, newAddress, } = req.body;

    // get User model with Addresses
    const user = await models.User.findOne({
        where: {
            id: req.user.id,
        },
        include: [ {model: models.Address, }, ],
    });

    // Check addresses are owned by User
    const { Addresses } = user;
    const userAddresses = Addresses.map((a) => a.address);
    if (!userAddresses.includes(oldAddress) || !userAddresses.includes(newAddress)) {
        return next(new Error(Errors.AddressesNotOwned))
    }

    // Get "To be merged" Address Model with its Profile
    const addressToBeMerged = await models.Address.findOne({
        where: {
            address: oldAddress,
            user_id: user.id,
        },
        include: [
            { model: models.OffchainProfile, },
        ],
    });

    // Get threads to be transfered
    const threadsToBeMerged = await models.OffchainThread.findAll({
        where: {
            address_id: addressToBeMerged.id,
        },
    });

    // Get comments to be transfered
    const commentsToBeMerged = await models.OffchainComment.findAll({
        where: {
            address_id: addressToBeMerged.id,
        },
    });

    // Get reactions to be transfered
    const reactionsToBeMerged = await models.OffchainReaction.findAll({
        where: {
            address_id: addressToBeMerged.id,
        }
    })

    // Get roles to be transfered
    const rolesToBeMerged = await models.Role.findAll({
        where: {
            address_id: addressToBeMerged.id,
        }
    });

    // Get Address to be new owner
    const addressToBeOwner = await models.Address.findOne({
        where: {
            address: newAddress,
            user_id: user.id,
        },
        include: [
            { model: models.OffchainProfile, },
            { model: models.Role, },
        ],
    });

    // Transfer Threads
    await Promise.all(
        threadsToBeMerged.map((thread) => {
            return thread.update({
                address_id: addressToBeOwner.id,
            });
        })
    );

    // Transfer Comments
    await Promise.all(
        commentsToBeMerged.map((comment) => {
            return comment.update({
                address_id: addressToBeOwner.id,
            });
        })
    )

    // Transfer Reactions
    await Promise.all(
        reactionsToBeMerged.map((reaction) => {
            return reaction.update({
                address_id: addressToBeOwner.id,
            });
        })
    )
    // Prune Reactions (doubled on object)
    const allReactions = await models.OffchainReaction.findAll({
        where: {
            address_id: addressToBeOwner.id,
        }
    });


    for (let i=0; i<allReactions.length-1; i++) {
        const reaction1 = allReactions[i];
        for (let j=i+1; j<allReactions.length; j++) {
            const reaction2 = allReactions[j];
            if (reaction1.proposal_id === reaction2.proposal_id
                || reaction1.thread_id === reaction2.proposal_id
                || reaction1.comment_id === reaction2.comment_id
            ) {
                await reaction2.destroy();
            }
        }
    }

    // Transfer and prune roles
    const compare = (role1, role2) => {
        if (role1.permission === 'admin'
            || (role1.permission === 'moderator' && role2.permission !== 'admin')
        ) {
            return [role2.destroy(), role1.update({ address_id: addressToBeOwner.id })];
        } else if (role2.permission === 'admin'
            || (role2.permission === 'moderator' && role1.permission !== 'admin')
        ) {
            return role1.destroy();
        }
    }

    const alreadyOwnedRoles = await models.Role.findAll({
        where: {
            address_id: addressToBeOwner.id,
        },
    });
    const alreadyOwnedChains = alreadyOwnedRoles.map((r) => r.chain_id ? r.chain_id : null);
    const alreadyOwnedComms = alreadyOwnedRoles.map((r) => r.offchain_community_id ? r.offchain_community_id : null);

    await Promise.all(
        rolesToBeMerged.map((role) => {
            if (role.chain_id && alreadyOwnedChains.includes(role.chain_id)) {
                    // it's included! check hierarchy and destory one of them.
                const roleTwo = alreadyOwnedRoles.find((r) => r.chain_id === role.chain_id);
                return compare(role, roleTwo)
            } else if (role.offchain_community_id && alreadyOwnedComms.includes(role.offchain_community_id)) {
                const role2 = alreadyOwnedRoles.find((r) => r.offchain_community_id === role.offchain_community_id);
                return compare(role, role2);
            } else {
                return role.update({ address_id: addressToBeOwner.id, });
            }
        }),
    );

    // TODO: What to do with the old Offchain Profile?
    // Keep Address and Offchain Profile in DB, but unassociate with User?
    // Just leave profile page empty (no comments/threads/reactions)?

    return res.json({ status: 'Success', });
};

export default mergeAccounts;
