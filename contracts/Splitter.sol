pragma solidity 0.4.13;

contract Splitter {
    mapping(address => uint256) public balances;
    uint256 public totalBalance;
    address internal owner;

    modifier onlyOwner
    {
        require(msg.sender == owner);
        _;
    }

    function Splitter()
    {
        owner = msg.sender;
	}

    function splitFunds(address beneficiary1, address beneficiary2) 
      payable
      public
    {
        uint256 amountToGive1 = msg.value / 2;
        uint256 amountToGive2 = msg.value - amountToGive1;

        balances[beneficiary1] += amountToGive1;
        balances[beneficiary2] += amountToGive2;

        totalBalance += msg.value;
	}

    function withdrawFunds()
      public
    {
        uint256 amountToSend = balances[msg.sender];
        require(amountToSend > 0);

        reduceBalances(msg.sender, amountToSend);
        msg.sender.transfer(amountToSend);
    }

    function forceSendFunds(address beneficiary)
      onlyOwner
      public
    {
        uint256 amountToSend = balances[beneficiary];
        require(amountToSend > 0);

        reduceBalances(beneficiary, amountToSend);
        beneficiary.send(amountToSend);
    }

    function reduceBalances(address recipient, uint256 amount)
      private
    {
        totalBalance -= amount;
        balances[recipient] = 0;
    }

    function killContract()
      onlyOwner
      public
    {
        if(totalBalance == 0) {
            address burnAddress = 0x000000000000000000000000000000000000dEaD;
            selfdestruct(burnAddress);
        }
    }

    function updateOwner(address newOwner)
      onlyOwner 
      public
    {
        owner = newOwner;
    }

    function () {}
}
