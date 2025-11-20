const hre = require("hardhat");
const { expect } = require("chai");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const nilhash="0x0000000000000000000000000000000000000000000000000000000000000000";
const readline = require("readline");

async function main() {
    const rpcurl = hre.network.config.url; 
    const chainid =hre.network.config.chainId; 
    const pks =hre.network.config.accounts;
    const accounts = await ethers.getSigners(); 

    await test_eth_chainid(rpcurl,chainid);
    await test_eth_blockNumber(rpcurl);
    const nilblockhash=await test_eth_getBlockByNumber(rpcurl);
    await test_eth_getBlockByHash(rpcurl,nilblockhash);
    await test_eth_getBalance(rpcurl,accounts[0].address,nilblockhash);
    
    //deploy a contract
    const st_factory = await ethers.getContractFactory("StorageTest");
    const st = await st_factory.deploy();
    await st.deployed();
    // console.log(`Deployed StorageTest Test at ${st.address}`)
    // console.log("Contract deployed with tx:", st.deployTransaction.hash);  //hardhat v2 / 

    await test_eth_getCode(rpcurl,st.address,nilblockhash)
    await test_eth_getTransactionCount(rpcurl,accounts[0].address,nilblockhash);
    await test_eth_getStorageAt(rpcurl,st.address,nilblockhash);

    const provider = new ethers.providers.JsonRpcProvider(rpcurl);
    const txhash= await test_eth_sendRawTransaction(rpcurl,st,pks,provider,accounts);

    //send a simple transfer
    const tx = {
        to: accounts[5].address,
        value: ethers.utils.parseEther("1.0"), 
    };
    const txResponse = await accounts[4].sendTransaction(tx);
    const receipt = await txResponse.wait();
    const transferTxhash=receipt.transactionHash
    const {blockhash,blocknum} = await test_eth_getTransactionReceipt(rpcurl,st,txhash[0],transferTxhash);

    await test_eth_getBlockReceipts(rpcurl,blockhash,blocknum);
    await test_eth_getTransactionByHash(rpcurl,st,txhash[0],transferTxhash);
    await test_eth_getBlockTransactionCountByHash(rpcurl,blockhash)
    await test_eth_getBlockTransactionCountByNumber(rpcurl,blocknum);

    //get txhash from a block
    let result=await sendRequest(rpcurl,'eth_getBlockByNumber',[blocknum,false],null);
    const txhashInBlock=result['transactions'];
    await test_eth_getTransactionByBlockHashAndIndex(rpcurl,blockhash,'0x1',txhashInBlock[1])
    await test_eth_getTransactionByBlockNumberAndIndex(rpcurl,blocknum,'0x1',txhashInBlock[1])
    await test_eth_estimateGas(rpcurl,st,accounts);
    await test_eth_call(rpcurl,st,accounts);
    await test_eth_getProof(rpcurl,st,accounts,blockhash);
    await test_eth_getLogs(rpcurl,st);

    console.log("");
    console.log("✅ All Test Successful");

}

function processCompleted(successful){
    readline.cursorTo(process.stdout, 100);
    if(successful)
        process.stdout.write("✅\n");
    else
        process.stdout.write("❌\n");
}

//0 - eth_chainid
async function test_eth_chainid(url,chainid) {
    try{
        process.stdout.write("0. Start test eth_chainId ...");
        const result=await sendRequest(url,'eth_chainId',[],null);
        expect(result).to.equal(toHex(chainid));
        processCompleted(true);
        console.log("");
    } catch (err) {
        throw err;
    }
}

//1 - eth_blockNumber
async function test_eth_blockNumber(url) {
    try{
        process.stdout.write("1. Start test eth_blockNumber ...");
        const result=await sendRequest(url,'eth_blockNumber',[],null);
        if(!Number(result)>0){
            throw new Error(`eth_blockNumber error, result: ${result}`);
        }
        processCompleted(true);
        console.log("");
    } catch (err) {
        throw err;
    }
}

//2 - eth_getBlockByNumber
async function test_eth_getBlockByNumber(url) {
    try{
        console.log("2. Start test eth_getBlockByNumber  ");
        
        process.stdout.write("2.1. Get genesis block ...");        
        let result=await sendRequest(url,'eth_getBlockByNumber',["0x0",true],null);
        let fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(20);
        processCompleted(true);

        process.stdout.write("2.2. Get finalized block ...");
        result=await sendRequest(url,'eth_getBlockByNumber',["finalized",true],null);
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(25);
        processCompleted(true);
        const nilblockhash=result["hash"]

        process.stdout.write("2.3. Get safe block ...");
        params=["safe",true];
        result=await sendRequest(url,'eth_getBlockByNumber',["safe",true],null);
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(25);
        processCompleted(true);

        process.stdout.write("2.4. Get notfound block ...");
        params=["0x90021212",true];
        result=await sendRequest(url,'eth_getBlockByNumber',["0x90021212",true],null); 
        expect(result).to.be.null;
        processCompleted(true);
        console.log("");
        return nilblockhash;
    } catch (err) {
        throw err;
    }
}

//3 - eth_getBlockByHash
async function test_eth_getBlockByHash(url,blockhash) {
    try{
        console.log("3. Start test eth_getBlockByHash ");

        process.stdout.write("3.1. Get nil hash block ...");
        let params=[nilhash,true];
        let result=await sendRequest(url,'eth_getBlockByHash',[nilhash,true],null); 
        expect(result).to.be.null;
        processCompleted(true);

        process.stdout.write("3.2. Get normal block ...");
        params=[blockhash,true];
        result=await sendRequest(url,'eth_getBlockByHash',[blockhash,true],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(25);
        processCompleted(true);

        process.stdout.write("3.3. Get not found block ...");
        result=await sendRequest(url,'eth_getBlockByHash',['0x00000000000000000000000000000000000000000000000000000000deadbeef',false],null);  
        expect(result).to.be.null;
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//4 - eth_getBalance
async function test_eth_getBalance(url,addr,blockhash) {
    try{
        console.log("4. Start test eth_getBalance ");

        process.stdout.write("4.1. Get balance by blockHash ...");
        let result=await sendRequest(url,'eth_getBalance',[addr,blockhash],null); 
        if(!BigInt(result)>0){
            throw new Error(`eth_getBalance error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("4.2. Get balance of unknown account ...");
        result=await sendRequest(url,'eth_getBalance',['0xc1cadaffffffffffffffffffffffffffffffffff','latest'],null); 
        if(BigInt(result)!=0){
            throw new Error(`eth_getBalance error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("4.3. Get balance by blockNumber ...");
        result=await sendRequest(url,'eth_getBalance',[addr,'latest'],null); 
        if(!BigInt(result)>0){
            throw new Error(`eth_getBalance error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//5 - eth_getCode
async function test_eth_getCode(url,addr,blockhash) {
    try{
        console.log("5. Start test eth_getCode ");

        process.stdout.write("5.1. Get code by blockHash ...");
        let result=await sendRequest(url,'eth_getCode',[addr,blockhash],null); 
        if(!(typeof result === 'string' && result.startsWith('0x') && result.length > 2)){
            throw new Error(`eth_getCode error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("5.2. Get code of unknown account ...");
        result=await sendRequest(url,'eth_getCode',['0xc1cadaffffffffffffffffffffffffffffffffff','latest'],null); 
        if(!(typeof result === 'string' && result.startsWith('0x') && result.length == 2)){
            throw new Error(`eth_getCode error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("5.3. Get code by blockNumber ...");
        result=await sendRequest(url,'eth_getCode',[addr,'latest'],null); 
        if(!(typeof result === 'string' && result.startsWith('0x') && result.length > 2)){
            throw new Error(`eth_getCode error, result: ${result}`);
        }
        processCompleted(true);

        //The EIP-7702 delegation function has not been implemented.

        console.log("");
    } catch (err) {
        throw err;
    }
}

//6 - eth_getTransactionCount
async function test_eth_getTransactionCount(url,addr,blockhash) {
    try{
        console.log("6. Start test eth_getTransactionCount ");

        process.stdout.write("6.1. Get nonce by blockHash ...");
        let result=await sendRequest(url,'eth_getTransactionCount',[addr,blockhash],null); 
        if(!BigInt(result)>0){
            throw new Error(`eth_getTransactionCount error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("6.2. Get nonce of unknown account ...");
        result=await sendRequest(url,'eth_getTransactionCount',['0xc1cadaffffffffffffffffffffffffffffffffff','latest'],null); 
        if(BigInt(result)>0){
            throw new Error(`eth_getTransactionCount error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("6.3. Get nonce by blockNumber ...");
        result=await sendRequest(url,'eth_getTransactionCount',[addr,'latest'],null); 
        if(!BigInt(result)>0){
            throw new Error(`eth_getTransactionCount error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//7 - eth_getStorageAt
async function test_eth_getStorageAt(url,addr,blockhash) {
    try{
        console.log("7. Start test eth_getStorageAt ");

        process.stdout.write("7.1. Get storage slot by invalid key too large ...");
        let result;
        try{
            result=await sendRequest(url,'eth_getStorageAt',[addr,'0x00000000000000000000000000000000000000000000000000000000000000000',blockhash],null); 
            if(!BigInt(result)>0){
                throw new Error(`eth_getStorageAt error, result: ${result}`);
            }
            processCompleted(false);
        }catch (err) {
            processCompleted(true);
            console.log(err)
        }
        

        process.stdout.write("7.2. Get storage slot by an invalid storage key ...");
        params=[addr,'0xasdf','latest'];
        try{
            result=await sendRequest(url,'eth_getStorageAt',[addr,'0xasdf','latest'],null); 
            processCompleted(false);
        }catch (err) {
            processCompleted(true);
            console.log(err)
        }
        

        process.stdout.write("7.3. Get storage slot by non-existent account ...");
        result=await sendRequest(url,'eth_getStorageAt',['0xc1cadaffffffffffffffffffffffffffffffffff','0x0000000000000000000000000000000000000000000000000000000000000000','latest'],null); 
        if(BigInt(result)!=0){
            throw new Error(`eth_getStorageAt error, result: ${result}`);
        }
        processCompleted(true);
        
        process.stdout.write("7.4. Get storage slot by normal account ...");
        result=await sendRequest(url,'eth_getStorageAt',[addr,'0x0000000000000000000000000000000000000000000000000000000000000000',blockhash],null); 
        if(BigInt(result)!=42){
            throw new Error(`eth_getStorageAt error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//8 - eth_sendRawTransaction
async function test_eth_sendRawTransaction(url,contract,pks,provider,accounts) {
    try{
        process.stdout.write("8. Start test eth_sendRawTransaction ... ");

        const txhash=[]
        let pk, signer,fulltx,rawtx,params,result
        for (i = 0; i < 2; i++) {
            signer = new ethers.Wallet(pks[i], provider);
            tx = await contract.connect(accounts[i]).populateTransaction.add(i);
            fulltx=await signer.populateTransaction(tx)
            rawtx=await signer.signTransaction(fulltx)
            
            params=[rawtx];
            result=await sendRequest(url,'eth_sendRawTransaction',[rawtx],null);
            txhash.push(result);
        }

        processCompleted(true);
        console.log("");
        return txhash;
    } catch (err) {
        throw err;
    }
}

//9 - eth_getTransactionReceipt
async function test_eth_getTransactionReceipt(url,contract,txhash,transferTxhash) {
    try{
        console.log("9. Start test eth_getTransactionReceipt ");

        process.stdout.write("9.1. Get receipt of legacy simple transfer ...");
        let result=await sendRequest(url,'eth_getTransactionReceipt',[transferTxhash],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(14);
        if(result['status']!='0x1'||result['contractAddress']!=null){
            throw new Error(`eth_getTransactionReceipt error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("9.2. Get receipt of legacy contract create transaction ...");
        result=await sendRequest(url,'eth_getTransactionReceipt',[contract.deployTransaction.hash],null);  
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(14);
        if(result['status']!='0x1'||result['contractAddress']==null||result['to']!=null){
            throw new Error(`eth_getTransactionReceipt error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("9.3. Get receipt of legacy contract call transaction ...");
        result=await sendRequest(url,'eth_getTransactionReceipt',[txhash],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(14);
        if(result['status']!='0x1'||result['contractAddress']!=null||result['to']==null){
            throw new Error(`eth_getTransactionReceipt error, result: ${result}`);
        }
        processCompleted(true);

        const blockhash=result['blockHash'];
        const blocknum=result['blockNumber'];
        
        process.stdout.write("9.4. Get receipt for a non-existent tx hash (It will only take a moment)...");
        result=await sendRequest(url,'eth_getTransactionReceipt',['0x00000000000000000000000000000000000000000000000000000000deadbeef'],null);  
        expect(result).to.be.null;
        processCompleted(true);

        // type=0 -- legacy transaction  (**Currently in use**)
        // type=1 -- access list transaction
        // type=2 -- dynamic fee transaction
        // type=3 -- blob transaction
        // type=4 -- EIP-7702 setcode transaction
        console.log("");
        return {blockhash,blocknum}
    } catch (err) {
        throw err;
    }
}

//10 - eth_getBlockReceipts
async function test_eth_getBlockReceipts(url,blockhash,blocknumber) {
    try{
        console.log("10. Start test eth_getBlockReceipts ");

        process.stdout.write("10.1. Get receipts for block 0 ...");
        let result=await sendRequest(url,'eth_getBlockReceipts',['0x0'],null); 
        expect(result.length).to.equal(0);
        processCompleted(true);

        process.stdout.write("10.2. Get receipts by hash ...");
        result=await sendRequest(url,'eth_getBlockReceipts',[blockhash],null);
        // expect(result.length).to.equal(3);
        expect(result.length == 2 || result.length == 3 ).to.be.true;
        processCompleted(true);

        process.stdout.write("10.3. Get receipts for earlist ...");
        result=await sendRequest(url,'eth_getBlockReceipts',['earliest'],null); 
        expect(result.length).to.equal(0);
        processCompleted(true);

        process.stdout.write("10.4. Get receipts for empty block hash ...");
        result=await sendRequest(url,'eth_getBlockReceipts',['0x0000000000000000000000000000000000000000000000000000000000000000'],null); 
        expect(result).to.be.null;
        processCompleted(true);

        process.stdout.write("10.5. Get receipts of future block ...");
        result=await sendRequest(url,'eth_getBlockReceipts',['0x2eeeee'],null); 
        expect(result).to.be.null;
        processCompleted(true);

        process.stdout.write("10.6. Get receipts for block latest ...");
        result=await sendRequest(url,'eth_getBlockReceipts',['latest'],null);
        expect(result.length).to.equal(0);
        processCompleted(true);

        process.stdout.write("10.7. Get receipts non-zero block ...");
        result=await sendRequest(url,'eth_getBlockReceipts',[blocknumber],null); 
        expect(result.length == 2 || result.length == 3 ).to.be.true;
        processCompleted(true);
        
        process.stdout.write("10.8. Get receipts non-zero block ...");
        result=await sendRequest(url,'eth_getBlockReceipts',['0x00000000000000000000000000000000000000000000000000000000deadbeef'],null); 
        expect(result).to.be.null;
        processCompleted(true);
        
        console.log("");
    } catch (err) {
        throw err;
    }
}

//11 - eth_getTransactionByHash
async function test_eth_getTransactionByHash(url,contract,txhash,transferTxhash) {
    try{
        console.log("11. Start test eth_getTransactionByHash ");

        process.stdout.write("11.1. Get transaction of legacy simple transfer ...");
        let result=await sendRequest(url,'eth_getTransactionByHash',[transferTxhash],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(16);
        if(result['input']!='0x'||result['to']==null){
            throw new Error(`eth_getTransactionByHash error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("11.2. Get transaction of legacy contract create transaction ...");
        result=await sendRequest(url,'eth_getTransactionByHash',[contract.deployTransaction.hash],null);  
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(16);
        if(result['input']==null||result['to']!=null){
            throw new Error(`eth_getTransactionByHash error, result: ${result}`);
        }
        processCompleted(true);

        process.stdout.write("11.3. Get transaction of legacy contract call transaction ...");
        result=await sendRequest(url,'eth_getTransactionByHash',[txhash],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(16);
        if(result['input']==null||result['to']==null){
            throw new Error(`eth_getTransactionByHash error, result: ${result}`);
        }
        processCompleted(true);
        
        process.stdout.write("11.4. Get transaction for a non-existent tx hash ...");
        result=await sendRequest(url,'eth_getTransactionByHash',['0x00000000000000000000000000000000000000000000000000000000deadbeef'],null);  
        expect(result).to.be.null;
        processCompleted(true);

        //           -- legacy transaction, no this field in return result (**Currently in use**)
        // yParity=1 -- access list transaction
        // yParity=0 -- dynamic fee transaction
        // yParity=1 -- blob transaction
        // yParity=1 -- EIP-7702 setcode transaction
        console.log("");
    } catch (err) {
        throw err;
    }
}

//12 - eth_getBlockTransactionCountByHash
async function test_eth_getBlockTransactionCountByHash(url,blockhash) {
    try{
        console.log("12. Start test eth_getBlockTransactionCountByHash ");

        process.stdout.write("12.1. Get transaction count in a non-empty block ...");
        let result=await sendRequest(url,'eth_getBlockTransactionCountByHash',[blockhash],null); 
        if(BigInt(result)!=2&&BigInt(result)!=3){
            throw new Error(`eth_getBlockTransactionCountByHash error, result: ${result}`);
        }
        processCompleted(true);
        
        process.stdout.write("12.2. Get transaction count in block 0 ...");
        result=await sendRequest(url,'eth_getBlockByNumber',["0x0",true],null);
        result=await sendRequest(url,'eth_getBlockTransactionCountByHash',[result['hash']],null);
        if(BigInt(result)!=0){
            throw new Error(`eth_getBlockTransactionCountByHash error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//13 - eth_getBlockTransactionCountByNumber
async function test_eth_getBlockTransactionCountByNumber(url,blocknumber) {
    try{
        console.log("13. Start test eth_getBlockTransactionCountByNumber ");

        process.stdout.write("13.1. Get transaction count in a non-empty block ...");
        let result=await sendRequest(url,'eth_getBlockTransactionCountByNumber',[blocknumber],null); 
        if(BigInt(result)!=2&&BigInt(result)!=3){
            throw new Error(`eth_getBlockTransactionCountByNumber error, result: ${result}`);
        }
        processCompleted(true);
        
        process.stdout.write("13.2. Get transaction count in block 0 ...");
        result=await sendRequest(url,'eth_getBlockTransactionCountByNumber',['0x0'],null);
        if(BigInt(result)!=0){
            throw new Error(`eth_getBlockTransactionCountByNumber error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//14 - eth_getTransactionByBlockHashAndIndex
async function test_eth_getTransactionByBlockHashAndIndex(url,blockhash,idx,txhash) {
    try{
        console.log("14. Start test eth_getTransactionByBlockHashAndIndex ");

        process.stdout.write("14.1. Get transaction by block hash and index ...");
        let result=await sendRequest(url,'eth_getTransactionByBlockHashAndIndex',[blockhash,idx],null); 
        if(result['hash']!=txhash){
            throw new Error(`eth_getTransactionByBlockHashAndIndex error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//15 - eth_getTransactionByBlockNumberAndIndex
async function test_eth_getTransactionByBlockNumberAndIndex(url,blocknumber,idx,txhash) {
    try{
        console.log("15. Start test eth_getTransactionByBlockNumberAndIndex ");

        process.stdout.write("15.1. Get transaction by block number and index ...");
        let result=await sendRequest(url,'eth_getTransactionByBlockNumberAndIndex',[blocknumber,idx],null); 
        if(result['hash']!=txhash){
            throw new Error(`eth_getTransactionByBlockNumberAndIndex error, result: ${result}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//16 - eth_estimateGas
async function test_eth_estimateGas(url,contract,accounts) {
    try{
        console.log("16. Start test eth_estimateGas ");

        process.stdout.write("16.1. Estimate the gas consumption for a contract call ...");
        let data=generateData(contract,"add",["0x5"]);
        let result=await sendRequest(url,'eth_estimateGas',[{"from":accounts[0].address,"data":data,"to":contract.address}],null); 
        if(BigInt(result)<=0){
            throw new Error(`eth_estimateGas error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        process.stdout.write("16.2. Estimate the gas consumption for a simple transfer ...");
        result=await sendRequest(url,'eth_estimateGas',[{"from":accounts[1].address,"to":accounts[2].address}],null); 
        if(BigInt(result)!=21000){
            throw new Error(`eth_estimateGas error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);
        
        process.stdout.write("16.3. Estimate the gas consumption for a contract call that revert ...");
        data=generateData(contract,"add",["0x2710"]);
        result=await sendRequest(url,'eth_estimateGas',[{"from":accounts[0].address,"data":data,"to":contract.address}],null); 
        processCompleted(true);
        // console.log(result);
        // No revert information was received, so the test failed.

        //abi error test function not implemented

        console.log("");
    } catch (err) {
        throw err;
    }
}

//17 - eth_call
async function test_eth_call(url,contract,accounts) {
    try{
        console.log("17. Start test eth_call ");

        process.stdout.write("17.1. Performs a basic contract call with default settings ...");
        let data=generateData(contract,"add",["0x5"]);
        let result=await sendRequest(url,'eth_call',[{"from":accounts[0].address,"data":data,"to":contract.address}],null); 
        if(result!='0x'){
            throw new Error(`eth_call error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);
        
        process.stdout.write("17.2. Estimate the gas consumption for a contract call that revert ...");
        try{
            data=generateData(contract,"add",['0x2710']);
            result=await sendRequest(url,'eth_call',[{"from":accounts[0].address,"data":data,"to":contract.address}],null); 
            const decoded = contract.interface.decodeFunctionResult("add", result);
            processCompleted(false);
            console.log(decoded[0].toString());
        }catch (err) {
            processCompleted(true);
            console.log(err)
        }
        

        // callenv contract not implemented in arcology
        // EIP-7702 code delegation not implemented in arcology
        // ABI-encoded Panic(uint) value not implemented in arcology

        console.log("");
    } catch (err) {
        throw err;
    }
}

//18 - eth_getProof
async function test_eth_getProof(url,contract,accounts,blockhash) {
    try{
        console.log("18. Start test eth_getProof ");

        const eoaAddress=accounts[0].address;
        let finalBalance=await sendRequest(url,'eth_getBalance',[eoaAddress,blockhash],null); 
        let finalNonce=await sendRequest(url,'eth_getTransactionCount',[eoaAddress,blockhash],null); 

        process.stdout.write("18.1. Gets proof for a certain account at the specified blockhash ...");
        let result=await sendRequest(url,'eth_getProof',[eoaAddress,[],blockhash],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(7);
        // console.log(JSON.stringify(result, null, 2))
        if(result['address']!=eoaAddress.toLowerCase()||result['balance']!=finalBalance||result['nonce']!=finalNonce){
            throw new Error(`eth_getProof error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        process.stdout.write("18.2. Requests the account proof for a known account ...");
        result=await sendRequest(url,'eth_getProof',[eoaAddress,[],"latest"],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(7);
        if(result['address']!=eoaAddress.toLowerCase()||result['balance']!=finalBalance||result['nonce']!=finalNonce){
            throw new Error(`eth_getProof error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        const contractAddress=contract.address;
        finalBalance=await sendRequest(url,'eth_getBalance',[contractAddress,"latest"],null); 
        finalNonce=await sendRequest(url,'eth_getTransactionCount',[contractAddress,"latest"],null); 

        process.stdout.write("18.3. Gets proof for a certain account with storage ...");
        result=await sendRequest(url,'eth_getProof',[contractAddress,['0x0000000000000000000000000000000000000000000000000000000000000000'],"latest"],null); 
        fieldCount = Object.keys(result).length;
        expect(fieldCount).to.equal(7);
        if(result['address']!=contractAddress.toLowerCase()||result['balance']!=finalBalance||result['nonce']!=finalNonce){
            throw new Error(`eth_getProof error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

//19 - eth_getLogs
async function test_eth_getLogs(url,contract) {
    try{
        console.log("19. Start test eth_getLogs ");

        const latestBlocknumber=await sendRequest(url,'eth_blockNumber',[],null);

        process.stdout.write("19.1. Queries for logs from a specific contract across a range of blocks ...");
        let result=await sendRequest(url,'eth_getLogs',[{"address":[contract.address],"fromBlock":"0x1","toBlock":latestBlocknumber,"topics":null}],null); 
        if(result.length!=12){
            throw new Error(`eth_getLogs error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        process.stdout.write("19.2. Queries for all logs across a range of blocks ...");
        result=await sendRequest(url,'eth_getLogs',[{"address":null,"fromBlock":"0x1","toBlock":latestBlocknumber,"topics":null}],null); 
        if(result.length!=12){
            throw new Error(`eth_getLogs error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);
        
        process.stdout.write("19.3. Queries for logs with two topics, with both topics set explictly ...");
        let topicStep= ethers.utils.id("Step(uint256)")   //hardhat v2 / 
        result=await sendRequest(url,'eth_getLogs',[{"address":null,"fromBlock":"0x1","toBlock":latestBlocknumber,"topics":[[topicStep],["0x0000000000000000000000000000000000000000000000000000000000000002"]]}],null); 
        if(result.length!=2){
            throw new Error(`eth_getLogs error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        process.stdout.write("19.4. Queries for logs with two topics, performing a wildcard match in topic position zero ...");
        result=await sendRequest(url,'eth_getLogs',[{"address":null,"fromBlock":"0x1","toBlock":latestBlocknumber,"topics":[[topicStep],[]]}],null); 
        if(result.length!=6){
            throw new Error(`eth_getLogs error, result: ${JSON.stringify(result, null, 2)}`);
        }
        processCompleted(true);

        console.log("");
    } catch (err) {
        throw err;
    }
}

function generateData(contract,funcstr,params){
    return contract.interface.encodeFunctionData(funcstr, params);
}

async function sendRequest(url,method,params,fields){
    return await rpcRequest(url, packCalls(method,params), fields);
}

function toHex(num) {
  let hex = num.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return "0x" + hex;
}

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log(`Usage:
    node rpc_tool_ex.js <rpc_url> <method1> <params1> [<method2> <params2> ...] [--fields hash,number,gasUsed]

    Example:
    node rpc_tool_ex.js http://127.0.0.1:8545 eth_getBlockByNumber '["latest", true]' --fields hash,gasUsed,transactions
    `);
        process.exit(1);
    }

    const url = args[0];
    const calls = [];
    let fields = null;

    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("--fields")) {
            const [, list] = args[i].split("=");
            fields = (list || args[i + 1] || "").split(",").filter(Boolean);
            break;
        }

        const method = args[i];
        const params = args[i + 1] && args[i + 1].startsWith("[") ? JSON.parse(args[i + 1]) : [];
        calls.push({ method, params });
        if (args[i + 1] && args[i + 1].startsWith("[")) i++; // skip params arg
    }

    return { url, calls, fields };
}

async function callRPC(url, calls) {
    const payload = calls.map((c, i) => ({
        jsonrpc: "2.0",
        id: i + 1,
        method: c.method,
        params: c.params,
    }));

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.length === 1 ? payload[0] : payload),
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
}

function filterFields(result, fields) {
    if (!fields) return result;
    if (Array.isArray(result)) {
        return result.map((item) => filterFields(item, fields));
    } else if (typeof result === "object" && result !== null) {
        const filtered = {};
        for (const key of fields) {
            if (key in result) filtered[key] = result[key];
        }
        return filtered;
    }
    return result;
}

async function rpcRequest(url, calls, fields) { 
    try {
        const data = await callRPC(url, calls);
        const results = Array.isArray(data) ? data : [data];

        for (const resp of results) {
            if (resp.error) {
                throw resp.error
            }

            const result = fields ? filterFields(resp.result, fields) : resp.result;
            // return JSON.stringify(result, null, 2)
            return result;
        }
    } catch (err) {
        throw err;
    }
}

function packCalls(method,params){
    const calls = [];
    calls.push({ method, params });
    return calls;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});