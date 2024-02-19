import sys
sys.path.append('../../..')

import math
from ammolite import (Cli, HTTPProvider, Account)
from utils import (wait_for_receipts, compile_contracts)
#from pymongo import MongoClient

# python distribute_kitties_v2.py http://192.168.1.108:8080 ../genesis_accounts_5m.txt  b1e0e9e68297aae01347f6ce0ff21d5f72d3fa0f 2289ae919f03075448d567c9c4a22846ce3711731c895f1bea572cef25bb346f mint-5m.txt res.txt

frontend = sys.argv[1]
accounts_file = sys.argv[2]
kitty_core_address = sys.argv[3]
coo_private_key = sys.argv[4]
#database = sys.argv[5]
output1 = sys.argv[5]
output2 = sys.argv[6]

private_keys = []
addresses = []
with open(accounts_file, 'r') as f:
    for line in f:
        line = line.rstrip('\n')
        segments = line.split(',')
        private_keys.append(segments[0])
        addresses.append(segments[1])

cli = Cli(HTTPProvider(frontend))
compiled_sol = compile_contracts('./contract')
kitty_core = compiled_sol['./contract/KittyCore.sol:KittyCore']
kitty_core_contract = cli.eth.contract(
    abi = kitty_core['abi'],
    address = kitty_core_address,
)

#mongo = MongoClient('localhost', 32768)
#db = mongo[database]

batchnum = 500

lines1 = []
lines2 = []
coo = Account(coo_private_key)
num_batches = int(math.ceil(len(private_keys)) / batchnum)
for i in range(num_batches):
    batch_start = i * batchnum
    batch_end = (i + 1) * batchnum
    if i == num_batches - 1:
        batch_end = len(private_keys)
    print('batch_start = {}, batch_end = {}'.format(batch_start, batch_end))

    txs = {}
    hashes = []
    for j in range(batch_start, batch_end):
        raw_tx, tx_hash = coo.sign(kitty_core_contract.functions.createPromoKitty(j, addresses[j]).buildTransaction({
            #'nonce': j,
            'gas': 1000000,
            'gasPrice': 1,
        }))
        txs[tx_hash] = raw_tx
        hashes.append(tx_hash)
        line = '{},{}'.format(raw_tx.hex(), tx_hash.hex())
        lines1.append(line)
    
    cli.sendTransactions(txs)
    candidates = []
    receipts = wait_for_receipts(cli, hashes)
    for j in range(len(hashes)):
        receipt = receipts[hashes[j]]
        if receipt['status'] != 1:
            assert False
        
        processed_receipt = kitty_core_contract.processReceipt(receipt)
        if 'Birth' not in processed_receipt:
            assert False
        
        #candidates.append({
        #    'private_key': private_keys[batch_start + j],
        #    'address': addresses[batch_start + j],
        #    'kitty': processed_receipt['Birth']['kittyId'],
        #})
        line = '{},{},{}'.format(private_keys[batch_start + j], addresses[batch_start + j], processed_receipt['Birth']['kittyId'])
        lines2.append(line)
    #db.candidates.insert_many(candidates)

print('len(lines1) = {}, line(lines2) = {}'.format(len(lines1), len(lines2)))

with open(output1, 'a') as f:
    for l in lines1:
        f.write(l+'\n')

with open(output2, 'a') as f:
    for l in lines2:
        f.write(l+'\n')
