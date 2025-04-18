// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressBoolean.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";


contract Cum {
    AddressU256Map private cummap=new AddressU256Map();

    constructor() {
    }

    event QueryBalance(uint256 val);

    function insert(address adr,uint256 val)public {  
        cummap.insert(adr, val, 0, type(uint256).max);
    }
    function set(address adr,uint256 val)public {  
        cummap.set(adr, int256(val));
    }

    function del(address adr)public {  
        cummap.del(adr);
    }

    function exist(address adr,uint256 val)public {  
        if(!cummap.exist(adr)){
            cummap.insert(adr, val, 0, type(uint256).max);
        }else{
            cummap.set(adr, int256(val));
        }
    }

    function existSet(address adr,uint256 val)public {  
        if(cummap.exist(adr)){
            cummap.set(adr, int256(val));
        }
    }

    function QueryVal(address adr) external{
        if(!cummap.exist(adr))
            emit QueryBalance(0);
        else
            emit QueryBalance(cummap.get(adr));
    }
}