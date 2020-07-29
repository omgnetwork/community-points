// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./tokens/SubredditPoint.sol";
import "./utils/OnlyFromAddress.sol";

/**
 * @notice Distribution contract for subreddit point
 *
 * This is a much simplified version with limited feature from the original Distribution contract of reddit.
 *
 * This contract is responsible to provide the information of how many points to be distributed
 * on each round and would mint the subreddit token accordingly to the subreddit owner.
 *
 * This contract should decrease some fixed percentage of distribution on each round.
 * However, 50% of the "burned" points would be re-distributed.
 */
contract Distribution is OnlyFromAddress, Ownable {
    using SafeMath for uint256;

    /**
     * availablePoints: total distributeable points in the round
     * baseSupply: the base supply that would decrease on each round with some fixed percentage
     * totalKarma: total Karma of that round
     */
    struct DistributionData {
        uint256 availablePoints;
        uint256 baseSupply;
        uint256 totalKarma;
    }

    // to simplify, use 100 instead of a more precise one
    uint256 public constant PERCENT_PRECISION = 100;

    SubredditPoint public subredditPointContract;
    address public subredditOwner;
    uint256 public supplyDecayPercent;
    uint256 public currentRound;

    // maps round number to the distributed data of points
    mapping(uint256 => DistributionData) public distributionRounds;

    constructor(
        SubredditPoint subredditPointContract_,
        uint256 supplyDecayPercent_,
        address subredditOwner_
    ) public {
        subredditPointContract = subredditPointContract_;
        supplyDecayPercent = supplyDecayPercent_;
        subredditOwner = subredditOwner_;

        currentRound = 0;
    }

    /**
     * Make sure only the deployer of the contract can call this function to avoid others from running
     * this function outside our deployment script.
     */
    function initRound(uint256 initialDistribution, uint256 totalKarma) external onlyOwner {
        require(currentRound == 0, "Initial round has already started");
        distribute(initialDistribution, initialDistribution, totalKarma);
    }

    /**
     * Different from original distribution contract, we passed in "burnedPoints" as an args here.
     * This is because it is not trivial to calculate the Layer2 burned point withouth waiting exit period.
     */
    function advanceToNextRound(uint256 burnedPoints, uint256 totalKarma) external onlyFrom(subredditOwner) {
        require(currentRound > 0, "Please call initRound to initialize the first round");

        DistributionData memory currentRoundDistribution = distributionRounds[currentRound];

        uint256 nextRoundDecrease = currentRoundDistribution.baseSupply.mul(supplyDecayPercent).div(PERCENT_PRECISION);
        uint256 nextRoundBaseSupply = currentRoundDistribution.baseSupply.sub(nextRoundDecrease);

        uint256 nextRoundAvailiblePoints = nextRoundBaseSupply.add(burnedPoints.div(2));

        distribute(nextRoundBaseSupply, nextRoundAvailiblePoints, totalKarma);
    }

    function distribute(uint256 baseSupply, uint256 availablePoints, uint256 totalKarma) private {
        subredditPointContract.mint(subredditOwner, availablePoints);
        currentRound++;
        distributionRounds[currentRound] = DistributionData({
            availablePoints: availablePoints,
            baseSupply: baseSupply,
            totalKarma: totalKarma
        });
    }
}
