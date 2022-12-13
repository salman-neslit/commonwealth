import 'chai/register-should';
import models from 'server/database';
import chai from 'chai';
import 'chai/register-should';
import getCommunities from 'server/routes/communities/getCommunities';
import { req, res } from 'test/unit/unitHelpers';
import { GetCommunitiesReq, OrderByOptions } from 'common-common/src/api/extApiTypes';
import 'test/integration/api/external/dbEntityHooks.spec';
import { testChains, testComments } from 'test/integration/api/external/dbEntityHooks.spec';
import { get } from "./appHook.spec";

describe('getCommunities Tests', () => {
  it('should return communities with specified community_id correctly', async () => {
    const r: GetCommunitiesReq = { community_id: testChains[0].id };
    const resp = await getCommunities(models, req(r), res()) as any;

    chai.assert.lengthOf(resp.result.communities, 1);
  });

  it('should return communities with specified network correctly', async () => {
    const r: GetCommunitiesReq = { network: testChains[0].network };
    const resp = await getCommunities(models, req(r), res()) as any;

    chai.assert.lengthOf(resp.result.communities, 2);
  });

  it('should return count only when specified correctly', async () => {
    const r: GetCommunitiesReq = { network: testChains[0].network, count_only: true };
    const resp = await getCommunities(models, req(r), res()) as any;

    chai.assert.equal(resp.result.count, 2);
    chai.assert.isUndefined(resp.result.communities);
  });

  it('should handle errors correctly', async () => {
    let resp = await get('/api/communities', {}, true);

    chai.assert.lengthOf(resp.result, 1);
    chai.assert.equal(resp.result[0].msg, 'Invalid value');
    chai.assert.equal(resp.result[0].param, 'community_id');

    resp = await get('/api/communities', {community_id: testComments[0].chain, count_only: 3}, true);

    chai.assert.lengthOf(resp.result, 1);
    chai.assert.equal(resp.result[0].msg, 'Invalid value');
    chai.assert.equal(resp.result[0].param, 'count_only');
  });
});