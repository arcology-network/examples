// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressBoolean.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";


contract DefCase {
    HashU256Map private _sum= new HashU256Map();
    uint256 kkk = 10;
    U256 flags = new U256();
    AddressU256Map private curPools=new AddressU256Map();

    constructor() {
        Runtime.defer(bytes4(keccak256(bytes("addU256(address,uint256)"))));    
    }

    event CounterQuery32(bytes32 key,uint256 value);
    event CounterQueryAdr(address key,uint256 value);
    event Step(uint256 _Step);

    function addU256(address adr,uint256 val)public {
        flags.push(1);

        /*
        bytes32 key=abi.decode(abi.encodePacked(adr,kkk), (bytes32));
        if(!_sum.exist(key)){
            _sum.insert(key, 0, 0, type(uint256).max);
        }
        _sum.set(key, int256(val));


        if(flags.committedLength()>0){
            for(uint i=0;i<_sum.fullLength();i++){
                emit CounterQuery32(_sum.keyAt(i),_sum.valueAt(i));
            }
        }
        */

        if(!curPools.exist(adr)){
            curPools.insert(adr, 0, 0, type(uint256).max);
        }
        curPools.set(adr, int256(val));

        if(flags.committedLength()>0){
            for(uint i=0;i<curPools.fullLength();i++){
                emit CounterQueryAdr(curPools.keyAt(i),curPools.valueAt(i));
            }
        }

        emit Step(7);
    }
}