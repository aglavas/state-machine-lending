import { defineStore } from 'pinia'
import { getWeb3, connect } from '../utils.js'
import StateMachine from '../../../build/contracts/StateMachine.json'

export const useStore = defineStore('stateMachine', {
  state: () => {
    return {
      web3: null,
      accounts: null,
      contract: null,
      networkId: null,
      lender: null,
      borrower: null,
      amount: null,
      interest: null,
      loanEnd: null,
      currentAccount: null,
      machineState: null
    }
  },
  getters: {
    isLenderConnected(state) {
        if (state.currentAccount === null) {
            return false;
        }

        return state.currentAccount.toUpperCase() == state.lender.toUpperCase();
    },
    isBorrowerConnected(state) {
      if (state.currentAccount === null) {
          return false;
      }

      return state.currentAccount.toUpperCase() == state.borrower.toUpperCase();
    },
    fullDebtAmount(state) {
      let bnAmount = state.web3.utils.toBN(state.amount);
      let bnInterest = state.web3.utils.toBN(state.interest);
      bnAmount = bnAmount.add(bnInterest);
      
      return bnAmount.toNumber();
    }
  },
  actions: {
    async registerWeb3() {
        this.web3 = await getWeb3();
        this.accounts = await this.web3.eth.getAccounts();
        this.networkId = await this.web3.eth.net.getId();

        let deployedNetwork = StateMachine.networks[this.networkId];        
        this.contract = new this.web3.eth.Contract(
            StateMachine.abi,
            deployedNetwork && deployedNetwork.address,
        );
        const [lenderAddress, borrowerAddress, loanAmount, loanInterest, loanEndTimestamp, connectedAddress] = await Promise.all([
            this.contract.methods.moneyLender().call(),
            this.contract.methods.moneyBorrower().call(),
            this.contract.methods.amount().call(),
            this.contract.methods.interest().call(),
            this.contract.methods.loanEnd().call(),
            connect()
        ]);
        
        this.lender = lenderAddress;
        this.borrower = borrowerAddress;
        this.amount = loanAmount;
        this.interest = loanInterest;
        this.loanEnd = loanEndTimestamp;
        this.currentAccount = connectedAddress;
        await this.refreshContractStatus();
    },
    async refreshContractStatus() {
        this.machineState = await this.contract.methods.state().call();
    }
  }
})