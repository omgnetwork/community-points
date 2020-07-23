const SubredditPoint = artifacts.require('SubredditPoint');
const Distribution = artifacts.require('Distribution');

const { BN, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Subreddit Point contract end to end', ([_, subredditOwner]) => {
  const SUPPLY_DECAY_PERCENT = 10;
  const INITIAL_DISTRIBUTION = 100000;
  const BURNED_POINTS_FIRST_ROUND = 100;

  let pointContract;
  let distributionContract;

  before('setup', async () => {
    pointContract = await SubredditPoint.new();
    distributionContract = await Distribution.new(
      pointContract.address,
      SUPPLY_DECAY_PERCENT,
      subredditOwner
    );
    await pointContract.transferOwnership(distributionContract.address);
  });

  describe('When initiates the round', () => {
    let totalSupplyAfterInitialRound;

    before(async () => {
      await distributionContract.initRound(INITIAL_DISTRIBUTION);
    });

    it('should mint the INITIAL_DISTRIBUTION of points', async () => {
      totalSupplyAfterInitialRound = await pointContract.totalSupply();
      expect(totalSupplyAfterInitialRound).to.be.bignumber.equal(new BN(INITIAL_DISTRIBUTION));
    });

    describe('When advanced to second round', () => {
      before(async () => {
        await distributionContract.advanceToNextRound(BURNED_POINTS_FIRST_ROUND);
      });

      it('should mint points of the available distribution', async () => {
        const totalSupplyAfterSecondRound = await pointContract.totalSupply();
        const distributionData = await distributionContract.distributionRounds(2);

        expect(totalSupplyAfterSecondRound).to.be.bignumber.equal(
          totalSupplyAfterInitialRound.add(distributionData.availablePoints)
        );
      });

      it('should have the base supply of second round decrease the percentage of SUPPLY_DECAY_PERCENT', async () => {
        const distributionData = await distributionContract.distributionRounds(2);
        const initialSupply = new BN(INITIAL_DISTRIBUTION);
        const decreaseAmount = new BN(INITIAL_DISTRIBUTION * SUPPLY_DECAY_PERCENT / 100)
        expect(distributionData.baseSupply).to.be.bignumber.equal(
          initialSupply.sub(new BN(decreaseAmount))
        );
      });

      it('should have the available to be base supply + 50% of burned points', async () => {
        const distributionData = await distributionContract.distributionRounds(2);
        const pointIncreaseByBurnedPoint = new BN(BURNED_POINTS_FIRST_ROUND / 2);

        expect(distributionData.availablePoints).to.be.bignumber.equal(
          distributionData.baseSupply.add(pointIncreaseByBurnedPoint)
        );
      });
    });
  });
});
