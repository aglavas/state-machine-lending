// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract StateMachine {
  enum State {
    PENDING,
    ACTIVE,
    CLOSED
  }
  State public state = State.PENDING;
  uint public amount;
  uint public interest;
  uint public loanEnd;
  address payable public moneyLender;
  address payable public moneyBorrower;
  
  constructor(uint loanAmount, uint loanInterest, uint loanDuration, address payable lender, address payable borrower) {
    amount = loanAmount;
    interest = loanInterest;
    loanEnd = block.timestamp + loanDuration;
    moneyLender = lender;
    moneyBorrower = borrower;
  }

  function borrow() external payable {
    require(msg.sender == moneyLender, 'Only lender can borrow.');
    require(address(this).balance == amount, 'Lender can borrow only exact amount.');
    _stateTransitionTo(State.ACTIVE);
    moneyBorrower.transfer(amount);
  }

  function repay() external payable {
    require(msg.sender == moneyBorrower, 'Only borrower can repay.');
    require(msg.value == amount + interest, 'Borrower must repay exact amount.');
    _stateTransitionTo(State.CLOSED);
    moneyLender.transfer(amount + interest);
  }

  function _stateTransitionTo(State to) internal {
    require(to != State.PENDING, 'Cannot transition to PENDING.');
    require(to != state, 'Cannot transition to current state.');
    if (to == State.ACTIVE) {
      require(state == State.PENDING, 'Only PENDING can be transitioned to ACTIVE.');
      state = State.ACTIVE;
    }
    if (to == State.CLOSED) {
      require(state == State.ACTIVE, 'Only ACTIVE can be transitioned to CLOSED.');
      require(block.timestamp >= loanEnd, 'Cannot close loan before the end.');
      state = State.CLOSED;
    }
  }
}
