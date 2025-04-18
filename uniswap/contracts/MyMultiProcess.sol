// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/multiprocess/Multiprocess.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";


contract MyMultiProcess {
    U256Cumulative sum=new U256Cumulative(1,100);
    event QueryBalance(uint256 val);

    function add(uint256 rows,uint256 cols)public {
        Multiprocess mp = new Multiprocess(rows);
        for(uint i=0;i<rows;i++)
            mp.push(1000000000, address(this), abi.encodeWithSignature("getSum(uint256)", cols)); // Will require about 1.5M gas
        mp.run();

        emit QueryBalance(sum.get());
    }

    function getSum(uint256 cols) public {
        for(uint i=0;i<cols;i++){
            sum.add(1);
        }
    }
}