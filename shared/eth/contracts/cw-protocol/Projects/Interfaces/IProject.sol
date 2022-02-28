// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IProjectBase.sol";

interface IProject is IProjectBase {
    event Curate(address sender, address token, uint256 amount);

    function bToken() external view returns (address);

    function cToken() external view returns (address);

    function totalCuratorFunding() external view returns (address);

    function curatorFee() external view returns (address);

    function initialize(
        DataTypes.ProjectMetaData memory _metaData,
        DataTypes.ProjectData memory _pData,
        uint256 _curatorFee,
        uint256 _protocolFee,
        address _protocolFeeTo,
        address _bToken,
        address _cToken
    ) external returns (bool);

    function curate(uint256 _amount) external returns (bool);

    function curatorsWithdraw() external returns (bool);
}
