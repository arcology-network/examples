// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/base/Base.sol";
import './libraries/Path.sol';

contract PoolDatas is Base{
    using Path for bytes;

    struct PoolData {
        address pooladr;
        address tokenA;
        address tokenB;
    }

    constructor() Base(Base.BYTES) {}

    
    function push(address pooladr, address tokenA,address tokenB) public {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        bytes memory data=abi.encode(PoolData({pooladr:pooladr,tokenA:tokenA,tokenB:tokenB}));
        // emit EmitBytes(data);
        bytes memory uuid=uuid();
        // emit EmitBytes(uuid);
        Base._set(uuid, data); 
    }
    

    event EmitBytes(bytes val);
    function get(uint256 idx) public virtual returns(address,address,address)  {
        bytes memory data=Base._get(idx);
        // emit EmitBytes(data);
        PoolData memory callback=abi.decode(data, (PoolData));
        return (callback.pooladr,
                callback.tokenA,
                callback.tokenB);
    }
}