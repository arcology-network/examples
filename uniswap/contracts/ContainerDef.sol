// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";

contract ContainerDef {
    U256 counterAdd = new U256();
    U256 counterSub = new U256();
    U256 flagsAdd = new U256(); 
    uint256 total=0;  

    event CounterQuery(uint256 value);
    event Step(uint256 _step);

    constructor() {
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))));             
    }
    function add(uint256 val)public {
        counterAdd.push(val); 
        counterSub.push(val);
        flagsAdd.push(1);

        if(flagsAdd.committedLength()>0){
            flagsAdd.clear();

            
            uint fulllength =  counterAdd.fullLength();  
            for(uint i=0;i<fulllength;i++){              
                total=total+counterAdd.get(i)+counterSub.get(i);
            }

            emit CounterQuery(total);

            counterAdd.clear();
            counterSub.clear();
        }
    }
    function getTotal() public returns(uint256){
        emit CounterQuery(total);
        return total;
    }
}