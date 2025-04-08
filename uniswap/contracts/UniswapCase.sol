// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressBoolean.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "./Bytes32U256Map.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";


contract UniswapCase {
    // AddressU256Map private _balances;

    // AddressBooleanMap private mapBools = new AddressBooleanMap();

    mapping (bytes32 => U256) private swapDataGroup;
    HashU256Map private _sum;
    U256 flags = new U256();
    uint256 kkk = 10;
    address internal constant adr1 = 0x21522c86A586e696961b68aa39632948D9F11170; 
    address internal constant adr2 = 0xa75Cd05BF16BbeA1759DE2A66c0472131BC5Bd8D; 
    address internal constant adr3 = 0x2c7161284197e40E83B1b657e98B3bb8FF3C90ed; 
    address internal constant adr4 = 0x57170608aE58b7d62dCdC3cbDb564C05dDBB7eee; 


    constructor() {
        // _balances = new AddressU256Map();
        // Runtime.defer(bytes4(keccak256(bytes("add(address,uint256)"))));
        _sum= new HashU256Map();
        Runtime.defer(bytes4(keccak256(bytes("addU256(address,uint256)"))));    

        bytes32 k1=abi.decode(abi.encodePacked(adr1,kkk), (bytes32));
        swapDataGroup[k1]= new U256();
        _sum.insert(k1, 0, 0, type(uint256).max);

        bytes32 k2=abi.decode(abi.encodePacked(adr2,kkk), (bytes32));
        swapDataGroup[k2]= new U256();
        _sum.insert(k2, 0, 0, type(uint256).max);

        bytes32 k3=abi.decode(abi.encodePacked(adr3,kkk), (bytes32));
        swapDataGroup[k3]= new U256();
        _sum.insert(k3, 0, 0, type(uint256).max);
                 
        bytes32 k4=abi.decode(abi.encodePacked(adr4,kkk), (bytes32));
        swapDataGroup[k4]= new U256();
        _sum.insert(k4, 0, 0, type(uint256).max);

        

    }

    event CounterQuery(bytes32 key,uint256 value);
    event KeysQuery(bytes32 key);
    event Step(uint256 _Step);
    // event CounterBool(address adr,bool value);

    function addU256(address adr,uint256 val)public {
        flags.push(1);

        bytes32 key=abi.decode(abi.encodePacked(adr,kkk), (bytes32));
        // if(address(swapDataGroup[key])==address(0)){
        //     swapDataGroup[key]=new U256();
        // }
        swapDataGroup[key].push(val);
        
        // if(!_sum.exist(key)){
        //     _sum.insert(key, 0, 0, type(uint256).max);
        // }
        _sum.set(key, int256(val));


        if(flags.committedLength()>0){
            for(uint i=0;i<_sum.fullLength();i++){
                bytes32 k = _sum.keyAt(i);
                emit KeysQuery(k);

                for(uint ii=0;ii<swapDataGroup[k].fullLength();ii++){
                    emit CounterQuery(k,swapDataGroup[k].get(ii));
                }
            }
        }
        emit Step(7);
    }

    // function addbool(address adr,bool val)public {
    //     if(!mapBools.exist(adr)){
    //         mapBools.set(adr,false);
    //     }
    //     if(mapBools.committedLength()>0){
    //         for(uint i=0;i<mapBools.fullLength();i++){
    //             emit CounterBool(mapBools.keyAt(i),mapBools.valueAt(i));
    //         }
    //     }
    // }

    // function add(address adr,uint256 val)public {
    //     if(!_balances.exist(adr)){
    //         _balances.insert(adr, 0, 0, type(uint256).max);
    //     }
    //     _balances.set(adr, int256(val)); 
        
    //     if(_balances.committedLength()>0){
    //         for(uint i=0;i<_balances.fullLength();i++){
    //             emit CounterQuery(_balances.keyAt(i),_balances.valueAt(i));
    //         }
    //     }
        
    // }
}