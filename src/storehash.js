import web3 from './web3';

const address = '0xb84b12e953f5bcf01b05f926728e855f2d4a67a9';

const abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getHash",
        "outputs": [
            {
                "name": "x",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "x",
                "type": "string"
            }
        ],
        "name": "sendHash",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
let web3Eth = web3.eth;
web3Eth.defaultChain = process.env.ROPSTEN;

export default new web3Eth.Contract(abi, address);