// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/shared/OrderedSet.sol";

contract OrderedSetEx {
    BytesOrderedSet container = new BytesOrderedSet(false);  
    event Query(address elem);

    function set(address adr,uint256 val)public {  
        container.set(abi.encodePacked(adr));
    }

    function list()public {  
        uint256 length=container.Length();
        for(uint idx=0;idx<length;idx++){
            bytes memory rawdata=container.get(idx);
            bytes20 resultAdr;
            for (uint i = 0; i < 20; i++) {
                resultAdr |= bytes20(rawdata[i]) >> (i * 8); 
            }
            emit Query(address(uint160(resultAdr)));
        }
    }

    function reset()public {  
        container.clear();
    }

}