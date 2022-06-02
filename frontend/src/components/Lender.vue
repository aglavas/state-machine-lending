<template>
  <div>
    <h2>Lender</h2>
    <div class="row">
     <div class="col-sm-12">
       <h3>Fund {{ this.stateMachineStore.amount }} WEI</h3>
       <div v-if="this.stateMachineStore.machineState != 1">
        <button class="btn btn-primary" @click="fund">Fund</button>
        <p>{{ result }}</p>
       </div>
       <div v-else>
        <p>Already borrowed. Waiting for repay.</p>
       </div>
     </div>
    </div>
  </div>
</template>

<script>

import { mapStores } from 'pinia'
import { useStore } from '../store/stateMachine.js'

export default {
  name: 'Lender',
  data() {
    return {
      result: null
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    fund() {
      let borrowPromise = this.stateMachineStore.contract.methods.borrow().send({from: this.stateMachineStore.currentAccount, gas: 3000000, value: this.stateMachineStore.amount});

      borrowPromise.then(() => {
        this.result = `Funds borrowed successfully.`;
        this.stateMachineStore.refreshContractStatus();
      }).catch((error) => {
        this.result = error;
      });
    }
  }
}
</script>
