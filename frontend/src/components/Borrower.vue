<template>
  <div>
    <h2>Borrower</h2>
    <div class="row">
     <div class="col-sm-12">
       <h3>Repay {{ this.stateMachineStore.amount }} WEI (principal) + {{ this.stateMachineStore.interest }} WEI (interest)</h3>
       <div v-if="this.stateMachineStore.machineState == 1">
        <button class="btn btn-primary" @click="repay">Repay</button>
        <p>{{ result }}</p>
       </div>
       <div v-else>
        <p>Waiting for lender to release the funds.</p>
       </div>
     </div>
    </div>
  </div>
</template>

<script>

import { mapStores } from 'pinia'
import { useStore } from '../store/stateMachine.js'

export default {
  name: 'Borrower',
  data() {
    return {
      result: null
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    repay() {
      let repayPromise = this.stateMachineStore.contract.methods.repay().send({from: this.stateMachineStore.currentAccount, gas: 3000000, value: this.stateMachineStore.fullDebtAmount});

      repayPromise.then(() => {
        this.result = `Funds repaid successfully.`;
        this.stateMachineStore.refreshContractStatus();
      }).catch((error) => {
        this.result = error;
      });
    }
  }
}
</script>
