const { expectRevert, time } = require('@openzeppelin/test-helpers');
const StateMachine = artifacts.require('StateMachine');

contract('StateMachine', (accounts) => {
  let stateMachine;
  const amount = 10000;
  const interest = 50;
  const duration = 100;

  before(async () => {
    stateMachine = await StateMachine.deployed();
  });

  it('Only lender can borrow', async () => {
    await expectRevert(stateMachine.borrow({from: accounts[2], value: amount}), 'Only lender can borrow.');
  });

  it('Contract should accept only exact amount', async () => {
    await expectRevert(stateMachine.borrow({from: accounts[1], value: 50}), 'Lender can borrow only exact amount.');
  });

  it('Should accept funds', async () => {
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[2]));
    await stateMachine.borrow({from: accounts[1], value: amount});
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[2]));
    const state = await stateMachine.state();
    assert(state.toNumber() === 1);
    assert(balanceAfter.sub(balanceBefore).toNumber() === amount);
  });

  it('Should NOT repay if not borrower who initiated repay', async () => {
    await expectRevert(stateMachine.repay({from: accounts[5], value: amount + interest}), 'Only borrower can repay.');
  });

  it('Should NOT repay if not exact amount', async () => {
    await expectRevert(stateMachine.repay({from: accounts[2] , value: 50}), 'Borrower must repay exact amount.');
  });

  it('Cannot repay loan prematurelly', async () => {
    await expectRevert(stateMachine.repay({from: accounts[2], value: amount + interest}), 'Cannot close loan before the end.');
  });

  it('Should repay', async () => {
    time.increase(duration + 10);
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    await stateMachine.repay({from: accounts[2], value: amount + interest});
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    const state = await stateMachine.state();
    assert(state.toNumber() === 2);
    assert(balanceAfter.sub(balanceBefore).toNumber() === (amount + interest));
  });
});