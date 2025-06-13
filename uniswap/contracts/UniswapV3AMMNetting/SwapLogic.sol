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

    
    function findMax(address pooladr,PoolDataMap pools,HashU256Map swapDataSum) external 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax){
        (address tokenA,address tokenB) = pools.get(pooladr);
        bytes32 keyA=PoolLibary.GetKey(pooladr,tokenA);
        bytes32 keyB=PoolLibary.GetKey(pooladr,tokenB);
        bool minIsA=false;
        (canswap,amountMinCounterPart,minIsA)=find(pooladr,tokenA,tokenB,keyA,keyB,swapDataSum);
        if(minIsA)
            (keyMin,keyMax)=(keyA,keyB);
        else
            (keyMin,keyMax)=(keyB,keyA);            
    }
    function find(address pooladr,address tokenA,address tokenB,bytes32 keyA,bytes32 keyB,HashU256Map swapDataSum) internal 
        returns(bool canswap,uint256 amountMinCounterPart,bool minIsA){
        uint256 amountA=swapDataSum.get(keyA);
        uint256 amountB=swapDataSum.get(keyB);  
        minIsA=false;
        if(amountA>0&&amountB>0){
            uint256 amountAB=PriceLibary.getAmountOut(pooladr, tokenA, tokenB, amountA);
            canswap=true; 
            uint256 amountMin=amountB;
            (address tokenMin,address tokenMax)=(tokenB,tokenA); 
            if(amountAB<amountMin){
                amountMin=amountA;
                (tokenMin,tokenMax)=(tokenA,tokenB);
                amountMinCounterPart=amountAB;
                minIsA=true;
            }else{
                amountMinCounterPart=PriceLibary.getAmountOut(pooladr, tokenMin, tokenMax, amountMin);
            }
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
            swapWithPools(listMin,listMax,PriceLibary.getSqrtPricex96(pooladr));
        }
    }

    function swapNetting(SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart,uint160 sqrtPriceX96) internal {
        uint256 dataSize=listMin.fullLength();
        if(dataSize>0){
            for(uint i=0;i<dataSize;i++){
                if(!listMin.exists(i)) continue;
                
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
        }
        
        dataSize=listMax.fullLength();
        if(dataSize>0){
            bool amm = true;
            for(uint i=0;i<dataSize;i++){
                if(!listMax.exists(i)) continue;
    
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
                        swapWithPool(listMax,i,sqrtPriceX96);
                    }
                }else{
                    swapWithPool(listMax,i,sqrtPriceX96);
                }
            }
        }
    }
    function swapWithPools(SwapCallDataArray listMin,SwapCallDataArray listMax,uint160 sqrtPriceX96) internal {
        if(address(listMin)!=address(0)){
            uint256 dataSize=listMin.fullLength();
            if(dataSize>0) {
                for(uint i=0;i<dataSize;i++){
                    if(!listMin.exists(i)) continue;
                    swapWithPool(listMin,i,sqrtPriceX96);
                }
            }
        }
        
        if(address(listMax)!=address(0)){
            uint256 dataSize=listMax.fullLength();
            if(dataSize>0) {
                for(uint i=0;i<dataSize;i++){
                    if(!listMax.exists(i)) continue;
                    swapWithPool(listMax,i,sqrtPriceX96);
                }
            }
        }
    }

    function swapWithPool(SwapCallDataArray list,uint idx,uint160 sqrtPriceX96) internal {
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
        uint256 amountout=ISwapRouter(router).exactInputExternal(amountIn,recipient,sqrtPriceLimitX96,tokenIn,tokenOut,fee,sender);
        EmitSwapEvent(list,idx,amountIn,amountout,sqrtPriceX96);
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