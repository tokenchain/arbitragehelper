'use strict';

const arbitrageHelper = require('../index');
const ccxt = require('ccxt');
require('ansicolor').nice;

const exchange = new ccxt.binance();

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const colorProfit = percentage => percentage > 0 ? `${percentage}`.green : `${percentage}`.red;

const targetAsset = 'ETH';
arbitrageHelper.findChains(targetAsset, exchange)
    .then(async function (chains) {
        console.log('Found ' + chains.length + ' symbol chains for ' + targetAsset);

        for (let chain of chains) {
            arbitrageHelper.calculateChainProfit(exchange, chain).then(chain => {
                console.log(chain + '; triage: ' + colorProfit(chain.triagePercentage) + ' %');
            });

            // throttle api calls otherwise your IP gets banned
            await exchange.throttle();
        }
    });