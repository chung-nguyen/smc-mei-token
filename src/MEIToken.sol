// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MEIToken is ERC20Burnable, Ownable {
    // MEI token has 18 decimal points as ethereum
    uint256 public constant DECIMALS = 10**18;

    // Total supply limit is 1 billion tokens
    uint256 public constant TOTAL_SUPPLY_LIMIT = 1000000000 * DECIMALS;

    // Unplanned reserve is 320 million tokens. This is used for liquidity, staking reward and R&D
    uint256 public constant TOTAL_UNPLANNED_RESERVE = 320000000 * DECIMALS;

    // Unlocking reserve requires several days holding
    uint256 public constant UNPLANNED_UNLOCK_HOLDING_DURATION = 3 days;

    // Opening time of MEI token
    uint256 public immutable openingTime;

    uint256 private _totalReleased;
    uint256 private _totalUnplannedReleased;
    uint256 private _pendingUnplannedAmount;
    uint256 private _unplannedReleaseTimeStamp;

    event RequestRelease(uint256 amount, uint256 releaseTime);

    /**
     * Constructor
     * @param name MEI Token
     * @param symbol MEI
     * @param openTime Opening time
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 openTime
    ) ERC20(name, symbol) {
        openingTime = openTime;
    }

    /**
     * Release vested tokens
     */
    function release() external onlyOwner {
        uint256 timeStamp = block.timestamp;
        require(
            timeStamp >= openingTime,
            "MEI Token: vesting has not started"
        );

        uint256 relasedAmount = getReleasableAmount(timeStamp);
        require(
            relasedAmount > 0,
            "MEI Token: no token ready yet"
        );
        
        _totalReleased = _totalReleased + relasedAmount;
        _mint(msg.sender, relasedAmount);
    }

    /**
     * Request to unlock from unplanned reserve which will hold for several days
     */
    function unlockUnplannedReserve(uint256 amount) external onlyOwner {
        uint256 timeStamp = block.timestamp;
        require(
            _pendingUnplannedAmount == 0,
            "MEI Token: another unlock is still pending"
        );        
        require(
            amount <= TOTAL_UNPLANNED_RESERVE - _totalUnplannedReleased,
            "MEI Token: not enough reserved to unlock"
        );

        _unplannedReleaseTimeStamp = timeStamp + UNPLANNED_UNLOCK_HOLDING_DURATION;
        _pendingUnplannedAmount = amount;

        emit RequestRelease(amount, _unplannedReleaseTimeStamp);
    }

    /**
     * Release tokens after unlocking of unplanned reserve finished holding
     */
    function releaseUnplannedReserve() external onlyOwner {
        uint256 timeStamp = block.timestamp;
        require(
            timeStamp >= _unplannedReleaseTimeStamp,
            "MEI Token: still holding unplanned reserve"
        );
        require(
            _pendingUnplannedAmount > 0,
            "MEI Token: no unplanend reserve to release"
        );

        uint256 releaseAmount = _pendingUnplannedAmount;
        _pendingUnplannedAmount = 0;
        _totalUnplannedReleased += releaseAmount;
        _mint(msg.sender, releaseAmount);
    }

    /**
     * Getters
     */
    function getVestingReleasedAmount() external view returns (uint256) {
        return _totalReleased;
    }

    function getUnplannedReleasedAmount() external view returns (uint256) {
        return _totalUnplannedReleased;
    }

    function getPendingUnplannedAmount() external view returns (uint256) {
        return _pendingUnplannedAmount;
    }

    function getTimeToReleaseUnplanned() external view returns (uint256) {
        return _unplannedReleaseTimeStamp;
    }

    /**
     * Calculate releasable amount from planned amount at time
     * @param timeStamp The time to release
     */
    function getReleasableAmount(uint256 timeStamp)
        public
        view
        returns (uint256)
    {
        uint256 quarter = (timeStamp - openingTime) / 7905600;

        uint256 vestedAmount;
        if (quarter < 4) {
            // Initial 311 millions
            vestedAmount = 311000000;
        } else if (quarter < 16) {
            // After 4th quarter, vest 30,750,000 every quarter until the end
            vestedAmount = 311000000 + (quarter - 3) * 30750000;
        } else {
            // Release everything after this point
            return TOTAL_SUPPLY_LIMIT - TOTAL_UNPLANNED_RESERVE;
        }
        
        return vestedAmount * DECIMALS - _totalReleased;
    }
}
