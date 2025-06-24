// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressUint256.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";

contract DepositBook {
    uint256 gasused=100000;
    U256Cumulative depositSum = new U256Cumulative(0, type(uint256).max);  
    U256 private flags =new U256();
    event PrintAdr(address adr);
    event PrintBalance(uint256 val);


    constructor() {  
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))));    
    }

    function add(uint256 val) public payable {
        uint256 requiredVal=gasused*tx.gasprice;
        require(msg.value>=requiredVal,"");
        if(msg.value>requiredVal){
            payable(msg.sender).transfer(msg.value-requiredVal);
        }

        depositSum.add(requiredVal);
        flags.push(1);

        if(flags.committedLength()>0){

            emit PrintAdr(address(this));
            emit PrintBalance(address(this).balance);
              
            flags.clear();            
            depositSum.sub(depositSum.get());
        }
    }


    function getBalance(address adr) public {
        emit PrintBalance(adr.balance);
    }
}