import Web3 from 'web3';
import React from 'react'
import './App.css';
import Contract from 'web3-eth-contract'
import detectEthereumProvider from '@metamask/detect-provider'
import ballotArtifact from './abi/Ballot.json'


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {account: "Loading...",
                      value: 0,
                      myContract: "",
                      provider: "",
                      win: "",
                      result: [],
                      counter: [0, 1, 2, 3, 4],
                      proposal: ["MetaMask ๐", "Trust Wallet ๐คจ", "CoinBase Wallet ๐", "MathWallet โ", "Binance Chain Wallet ๐คฏ"]
                      };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.votejs()
        this.resultBallotjs()
        this.winningProposaljs()
    }

    async componentDidMount() {
        try {
            let chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.chainIdValidator(chainId);
            let provider= await this.initWeb3();
            let account= await this.getAccount();
            window.ethereum.on('accountsChanged', (accounts) => {this.setState({account: accounts});});
            window.ethereum.on('chainChanged', (_chainId) => {this.chainIdValidator(_chainId)});
            let netId = "1280"
            let myContract= await this.initContractInstance(ballotArtifact, netId);
            this.resultBallotjs();
            this.winningProposaljs();
            let timerIdRes = setInterval(() => this.resultBallotjs(), 5000);
            let timerIdWin = setInterval(() => this.winningProposaljs(), 5000);
            this.resultBallotjs();
            this.winningProposaljs();
        } catch (error) {
            console.log('Smth went wrong:\n', error);
        }
    }

    async initWeb3(){
        let provider;
        if(typeof window.ethereum != 'undefined'){
            provider = await detectEthereumProvider();
            this.setState({provider: provider})
        }else{
            provider= new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
            this.setState({provider: provider})
        }
        return provider;
    }

    async getAccount(){
        try {
            this.setState({account: await window.ethereum.request({method: "eth_requestAccounts"})});
        } catch (error) {
            if (error.code === 4001) {
                console.log("Metamask Connection Cancelled");
            } else {
                alert("Install Metamask to Connect");
            }
        }
    }

    initContractInstance(artifact, netId){
        Contract.setProvider(this.state.provider);
        let BallotContract = new Contract(artifact.abi, artifact.networks[netId].address);
        this.setState({myContract: BallotContract})
        return this.state.myContract;
    }

    chainIdValidator(_chainId){
        if (_chainId != 0x500){
            alert('ะะตัะตะบะปััะธัะต ัะตัั ะฝะฐ MoonRabbit EVM');
            window.location.reload()
        }
    }

    proposalValidator(error, transactionHash){
        console.log(error + ", " + transactionHash);
        if(typeof transactionHash == "undefined") {
            console.log(error + ", " + transactionHash);
        } else {
            localStorage.setItem('proposal', this.state.value);
        }
    }

    async votejs(){
        console.log(this.state.value);
        let val = await this.state.myContract.methods.vote(this.state.value).send({from: this.state.account[0]}, (error, transactionHash) => {this.proposalValidator(error, transactionHash)});

        // this.setState({value: val});
        // localStorage.setItem('proposal', this.state.value);
    }

    async winningProposaljs(){
        let win = await this.state.myContract.methods.winningProposal().call({from: this.state.account[0]}, function(error, result){ console.log(error + ", " + result); return result;});
        this.setState({win: win});
    }

    async resultBallotjs(){
        let result = await this.state.myContract.methods.resultBallot().call({from: this.state.account[0]}, function(error, result){ console.log(error + ", " + result); return result;});
        this.setState({result: result});
    }

    render() {
  return (
    <div className="App">
      <h1 className="head">ะะฐั ะฐะดัะตั: {this.state.account}</h1>
        <form onSubmit={this.handleSubmit} className="form">
            <label>
                ะัะฑะตัะธัะต ัะฒะพะน ะปัะฑะธะผัะน ะบะพัะตะปัะบ:<br/><br/>
                <select value={this.state.value} onChange={this.handleChange}>
                    <option value="0">MetaMask ๐</option>
                    <option value="1">Trust Wallet ๐คจ</option>
                    <option value="2">CoinBase Wallet ๐</option>
                    <option value="3">MathWallet โ</option>
                    <option value="4">Binance Chain Wallet ๐คฏ</option>
                </select>
            </label><br/><br/>
            <input type="submit" value="ะัะพะณะพะปะพัะพะฒะฐัั" className="sub sub-animate sub-white"/>
            <p>ะะฐั ะฒัะฑะพั: { this.state.proposal[localStorage.getItem('proposal')] || (<p>ะั ะตัั ะฝะต ะฒัะฑัะฐะปะธ</p>)} </p><br/>
        </form>
        <div className="res">
        <p>ะะธะดะตั ะณะพะปะพัะพะฒะฐะฝะธั: { (this.state.result.reduce(function(sum, elem) {return sum + elem;}, 0) > 0 && this.state.result.length > 0) ? this.state.proposal[this.state.win] : (<p>ะัั ะฝะตั ะณะพะปะพัะพะฒ</p>)} </p><br/>
        <p>ะ?ะตะทัะปััะฐัั ะณะพะปะพัะพะฒะฐะฝะธั: </p>
        {this.state.counter.map(counter => (<p>{this.state.proposal[counter]} - {this.state.result[counter]}</p>))}
        </div>
    </div>);
  }
}

export default App;
