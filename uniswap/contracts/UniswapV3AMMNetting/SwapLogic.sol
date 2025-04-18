// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.6.0;
import "./libraries/PriceLibary.sol";
import "./libraries/PoolLibary.sol";
import "./SwapCallDataArray.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
import "../UniswapV3Periphery/libraries/TransferHelper.sol";
import "./interfaces/ISwapRouter.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "./PoolDatasMap.sol";




contract SwapLogic {
    // using Path for bytes;
    bytes32 constant eventSigner=keccak256(bytes("Swap(address,address,int256,int256,uint160,uint128,int24)"));    
    event WriteBackEvent(bytes32 indexed pid,bytes32 indexed eventSigner,bytes eventContext);
    bytes32 constant INDEXED_SPLITE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    address router;

     
    constructor(address _router) {
        router=_router;
    }

    // function GetPid()external returns (bytes32 pid){
    //     pid=abi.decode(Runtime.pid(), (bytes32));
    // }
    
    function findMax(address pooladr,PoolDataMap pools,HashU256Map swapDataSum) external 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax){
        (address tokenA,address tokenB) = pools.get(pooladr);
        
        (canswap,amountMinCounterPart,keyMin,keyMax)=find(pooladr,tokenA,tokenB,swapDataSum);
        
    }
    function find(address pooladr,address tokenA,address tokenB,HashU256Map swapDataSum) internal 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax){
        keyMin=PoolLibary.GetKey(pooladr,tokenA);
        uint256 amountA=swapDataSum.get(PoolLibary.GetKey(pooladr,tokenA));
        uint256 amountAB=PriceLibary.getAmountOut(pooladr, tokenA, tokenB, amountA);
        keyMax=PoolLibary.GetKey(pooladr,tokenB);
        uint256 amountB=swapDataSum.get(PoolLibary.GetKey(pooladr,tokenB));  
        if(amountA>0&&amountB>0){
            canswap=true; 
            uint256 amountMin=amountB;
            (address tokenMin,address tokenMax)=(tokenB,tokenA); 
            if(amountAB<amountMin){
                amountMin=amountA;
                (tokenMin,tokenMax)=(tokenA,tokenB);
                amountMinCounterPart=amountAB;
            }else{
                amountMinCounterPart=PriceLibary.getAmountOut(pooladr, tokenMin, tokenMax, amountMin);
            }
            keyMin=PoolLibary.GetKey(pooladr,tokenMin);
            keyMax=PoolLibary.GetKey(pooladr,tokenMax);
        }else{
            canswap=false;
        }
    }

    function depositSingle(address tokenIn,address sender,uint256 amountIn) external{
        ISwapRouter(router).safeTransferFrom(tokenIn, sender, amountIn);
    }

    function swap(bool canswap,SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart) external{
        if(canswap){
            swapNetting(listMin,listMax,pooladr,amountMinCounterPart,PriceLibary.getSqrtPricex96(pooladr));
        }else{
            swapWithPools(listMin,listMax);
        }
    }

    function swapNetting(SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart,uint160 sqrtPriceX96) internal {
        uint256 dataSize=listMin.fullLength();
        for(uint i=0;i<dataSize;i++){
            if(!listMin._exists(i)) continue;
            ( ,
              ,
            address  tokenOut,
              ,
              ,
            address  recipient,
            uint256  amountIn,
              ,
            uint256  amountOut
            )=listMin.get(i);
            ISwapRouter(router).safeTransfer(tokenOut, recipient, amountOut);
            EmitSwapEvent(listMin,i,amountIn,amountOut,sqrtPriceX96);
        }

        dataSize=listMax.fullLength();
        bool amm = true;
        for(uint i=0;i<dataSize;i++){
            if(!listMax._exists(i)) continue;
            ( ,
            address  tokenIn,
            address  tokenOut,
             ,
             ,
            address  recipient,
            uint256  amountIn,
            ,
            uint256  amountOut
            )=listMax.get(i);

            if(amm){
                if(amountMinCounterPart>=amountIn){
                    amountMinCounterPart=amountMinCounterPart-amountIn;
                    ISwapRouter(router).safeTransfer(tokenOut, recipient, amountOut);
                    EmitSwapEvent(listMax,i,amountIn,amountOut,sqrtPriceX96);
                    if(amountMinCounterPart==0){
                        amm=false;
                    }
                }else{
                    uint256 amountPart=PriceLibary.getAmountOut(pooladr, tokenIn, tokenOut, amountMinCounterPart);
                    ISwapRouter(router).safeTransfer(tokenOut, recipient, amountPart);
                    EmitSwapEvent(listMax,i,amountMinCounterPart,amountPart,sqrtPriceX96);
                    listMax.update(i,amountIn-amountMinCounterPart);
                    amm=false;
                    swapWithPool(listMax,i);
                }
            }else{
                swapWithPool(listMax,i);
            }
        }
    }
    function swapWithPools(SwapCallDataArray listMin,SwapCallDataArray listMax) internal {
        if(address(listMin)!=address(0)){
            uint256 dataSize=listMin.fullLength();
            for(uint i=0;i<dataSize;i++){
                if(!listMin._exists(i)) continue;
                swapWithPool(listMin,i);
            }
        }
        
        if(address(listMax)!=address(0)){
            uint256 dataSize=listMax.fullLength();
            for(uint i=0;i<dataSize;i++){
                if(!listMax._exists(i)) continue;
                swapWithPool(listMax,i);
            }
        }
    }
    function swapWithPool(SwapCallDataArray list,uint idx) internal {
        ( ,
            address  tokenIn,
            address  tokenOut,
            uint24  fee,
            address sender,
            address  recipient,
            uint256  amountIn,
            uint160   sqrtPriceLimitX96,
              
        )=list.get(idx);
        ISwapRouter(router).safeTransfer(tokenIn, sender, amountIn);   //refund from common account
        ISwapRouter(router).exactInputExternal(amountIn,recipient,sqrtPriceLimitX96,tokenIn,tokenOut,fee,sender);
    }
    function EmitSwapEvent(SwapCallDataArray list,uint idx,uint256 amount0,uint256 amount1,uint160 sqrtPriceX96)internal{
        (bytes32 txhash ,
            ,
            ,
            ,
        address sender,
        address  recipient,
            ,
            ,
        )=list.get(idx);
        emit WriteBackEvent(txhash,eventSigner,abi.encode(sender,recipient,INDEXED_SPLITE,amount0,amount1,sqrtPriceX96,0,0));
    }
}