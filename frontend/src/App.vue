<template>
  <div id="app" class="container">
    <h1 class="text-center">Loan State Machine</h1>
    <p>Borrower: {{ this.stateMachineStore.borrower }}</p>
    <p>Lender: {{ this.stateMachineStore.lender }}</p>
    <p>Amount: {{ this.stateMachineStore.amount }} WEI</p>
    <p>Interest: {{ this.stateMachineStore.interest }} WEI</p>
    <p>Loan End: {{ new Date(parseInt(this.stateMachineStore.loanEnd) * 1000).toLocaleString() }}</p>
    <p>Contract State: {{ machineState }}</p>
    <div v-if="this.stateMachineStore.isLenderConnected">
      <Lender></Lender>
    </div>
    <div v-else-if="this.stateMachineStore.isBorrowerConnected">
      <Borrower></Borrower>
    </div>
  </div>
</template>

<script>

import Lender from './components/Lender.vue';
import Borrower from './components/Borrower.vue';
import { mapStores } from 'pinia';
import { useStore } from './store/stateMachine.js';

export default {
  name: 'App',
  components: {
    Lender,
    Borrower
  },
  data() {
    return {
      ready: false,
    }
  },
  computed: {
    ...mapStores(useStore),
    machineState() {
      if (this.stateMachineStore.machineState == 0) {
        return 'PENDING';
      } else if (this.stateMachineStore.machineState == 1) {
        return 'ACTIVE';
      } else {
        return 'CLOSED';
      }
    }
  },
  async mounted() {
    await this.stateMachineStore.registerWeb3();
    this.ready = true;
  },
}
</script>
