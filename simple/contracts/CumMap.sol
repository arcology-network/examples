// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";


contract CumMap {
    AddressU256CumMap private cummap=new AddressU256CumMap();

    constructor() {
    }

    event QueryBalance(uint256 val);

    function insertRange(address adr,uint256 val)public {  
        cummap.set(adr, int256(val), 0, 100);
    }

    function insert(address adr,uint256 val)public {  
        cummap.set(adr, int256(val), 0, type(uint256).max);
    }
    function set(address adr,uint256 val)public {  
        cummap.set(adr, int256(val));
    }

    function reset(address adr)public {  
        cummap._resetByKey(abi.encodePacked(adr));
    }

    function del(address adr)public {  
        cummap.del(adr);
    }

    function exist(address adr,uint256 val)public {  
        if(!cummap.exist(adr)){
            cummap.set(adr, int256(val), 0, type(uint256).max);
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