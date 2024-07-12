

pragma solidity >=0.8 <0.9.0;

import "../ds-auth/src/auth.sol";
import "../ds-math/src/math.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressUint256.sol";

contract MyToken {
    bool                   public  stopped;
    U256Cumulative         public  totalSupply;
    AddressUint256Map      public  balanceOf = new AddressUint256Map();
    string                 public  symbol;
    uint8                  public  decimals = 18; 
    string                 public  name = ""; 

    constructor(string memory symbol_) public {
        symbol = symbol_;
        totalSupply = new U256Cumulative(0, type(uint256).max);
    }

    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event Mint(address indexed guy, uint wad);
    event Burn(address indexed guy, uint wad);
    event Stop();
    event Start();
    event Step(uint step);
    event Balance(uint256 bal);

    modifier stoppable {
        require(!stopped, "stopped");
        _;
    }

    function approves(address guy) external returns (bool) {
        return approve(guy, type(uint256).max);
        
    }