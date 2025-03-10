// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
// import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";
// import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";


contract ContainerDef {
    U256 counterAdd = new U256();
    U256 counterSub = new U256();
    U256 flagsAdd = new U256(); 

    event CounterQuery(uint256 value);

    constructor() {
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))));             
    }
    function add(uint256 val)public {
        counterAdd.push(val); 
        counterSub.push(val);
        flagsAdd.push(1);

        if(flagsAdd.committedLength()>0){
            flagsAdd.clear();

            uint total=0;
            // for(uint256 i=0;i<counterAdd.fullLength();i++){    
            uint fulllength =  counterAdd.fullLength();   
            for(uint i=0;i<fulllength;i++){              
                if(!counterAdd._exists(i)) {
                    continue;
                }  
                total=total+counterAdd.get(i)+counterSub.get(i);
            }

            emit CounterQuery(total);

            counterAdd.clear();
            counterSub.clear();
        }
    }
}