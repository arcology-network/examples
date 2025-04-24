// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";


contract CompositeObj {
    struct InterData {
        U256 list;
        U256Cumulative sum;
    }

    uint256 total=0;  
    mapping (address => InterData) private swapDataGroup;
    U256 flags = new U256();

    address[4] adrs=[0x21522c86A586e696961b68aa39632948D9F11170,0xa75Cd05BF16BbeA1759DE2A66c0472131BC5Bd8D
                    ,0x2c7161284197e40E83B1b657e98B3bb8FF3C90ed,0x57170608aE58b7d62dCdC3cbDb564C05dDBB7eee];


    constructor() {
        Runtime.defer(bytes4(keccak256(bytes("addU256(address,uint256)"))));    

        for(uint i=0;i<4;i++){
            U256 u256=new U256();
            U256Cumulative li=new U256Cumulative(1,100);
            swapDataGroup[adrs[i]]=InterData({
                list:u256,
                sum:li
            });
        }
    }

    event CounterQuery(uint256 value);

    function addU256(address adr,uint256 val)public {
        flags.push(1);

        swapDataGroup[adr].list.push(val);
        swapDataGroup[adr].sum.add(val);

        if(flags.committedLength()>0){
            for(uint i=0;i<4;i++){
                uint256 sum=1;
                for(uint ii=0;ii<swapDataGroup[adrs[i]].list.fullLength();ii++){
                    sum=sum*swapDataGroup[adrs[i]].list.get(ii);
                }
                total=total+sum;
            }
        }
    }

    function getTotal() public returns(uint256){
        emit CounterQuery(total);
        return total;
    }
}