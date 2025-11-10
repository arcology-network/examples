#!/usr/bin/env bash

echo '*****************************enter eth-examples*****************************************************'
cd eth-examples
npm run test:compatibility 

npm run test:serial 
cd ..
echo '******************************enter ds-token****************************************************'
cd ds-token
npm run test:serial
cd ..
echo '******************************enter scaffold****************************************************'
cd scaffold
npm run test:serial
cd ..
echo '******************************enter scaffold****************************************************'
cd simple
npm run test:serial
cd ..
echo '******************************enter uniswap****************************************************'
cd uniswap
npm run test:serial 
cd ..