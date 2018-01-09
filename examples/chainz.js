'use strict';

const arbitrageHelper = require('../index');
const ccxt = require('ccxt');
const exchange = new ccxt.binance();

// exchange.fetchTickers().then(function (tickers) { console.log(Object.keys(tickers)); });

const targetAsset = 'BTC';
const helper = new arbitrageHelper.symbolFinder(exchange, false);
const symbols = helper.getCompatibleSymbols(targetAsset);

function matchSymbol(targetAsset, edgeSymbol, innerSymbol) {
    if (edgeSymbol.base == targetAsset) {
        if (edgeSymbol.quote == innerSymbol.base || edgeSymbol.quote == innerSymbol.quote) {
            return true;
        }
        return false;
    } else if (edgeSymbol.quote == targetAsset) {
        if (edgeSymbol.base == innerSymbol.base || edgeSymbol.base == innerSymbol.quote) {
            return true;
        }
        return false;
    }
    return false;
}

let tickerCache = [];

async function fetchCachedTicker(exchange, symbol) {
    if (!symbol in tickerCache) {
        tickerCache[symbol] = await exchange.fetchTicker(firstSymbol.symbol);
    }
    return tickerCache[symbol];
}

const chainsPromise = symbols.then(async function ({ sourceSymbols, compatibleSymbols }) {
    let chainz = [];

    for (let firstSymbol of sourceSymbols) {
        for (let secondSymbol of compatibleSymbols) {
            if (!matchSymbol(targetAsset, firstSymbol, secondSymbol)) {
                continue;
            }
            for (let thirdSymbol of sourceSymbols) {
                if (matchSymbol(targetAsset, thirdSymbol, secondSymbol)) {
                    // if (chainz.length == 1) {
                    //     continue;
                    // }
                    chainz.push([firstSymbol, secondSymbol, thirdSymbol]);
                    // console.log('[' + firstSymbol.base + ' ' + firstSymbol.quote + ']->[' + secondSymbol.base + ' ' + secondSymbol.quote + ']->[' + thirdSymbol.base + ' ' + thirdSymbol.quote + ']');
                    console.log('[' + firstSymbol.symbol + ']->[' + secondSymbol.symbol + ']->[' + thirdSymbol.symbol + ']');
                }
            }
        }
    }

    return chainz;
});

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

chainsPromise.then(async function (chains) {
    console.log('Found ' + chains.length + ' symbol chains for ' + targetAsset);

    for (let chain of chains) {
        // console.log(chain);
        let [ symbol1, symbol2, symbol3 ] = chain;
        arbitrageHelper.triageForMarkets(exchange, symbol1.symbol, symbol2.symbol, symbol3.symbol)

        // throttle api calls otherwise your IP gets banned
        await sleep (exchange.rateLimit)
    }

});