pragma solidity 0.4.13;

contract Splitter {
    mapping(address => uint256) public balances;
    address internal owner;
    uint256 private totalBalance;

    modifier onlyOwner
    {
        require(msg.sender == owner);
        _;
    }

	function Splitter()
      payable 
    {
        owner = msg.sender;
	}

	function splitFunds(address beneficiary1, address beneficiary2) 
      payable
    {
        uint256 amountToGive1 = msg.value / 2;
        uint256 amountToGive2 = msg.value - amountToGive1;

        balances[beneficiary1] += amountToGive1;
        balances[beneficiary2] += amountToGive2;

        totalBalance += msg.value;
	}

    function withdrawFunds()
    {
        uint256 amountToSend = balances[msg.sender];
        require(amountToSend > 0);

        reduceBalances(msg.sender, amountToSend);
        msg.sender.transfer(amountToSend);
    }

    function reduceBalances(address recipient, uint256 amount)
      private
    {
        totalBalance -= amount;
        balances[recipient] = 0;
    }

    function sendFunds(address beneficiary)
      onlyOwner
    {
        uint256 amountToSend = balances[beneficiary];
        require(amountToSend > 0);

        reduceBalances(beneficiary, amountToSend);
        beneficiary.send(amountToSend);
    }

    function withdrawExtraFunds()
      onlyOwner
    {
        owner.transfer(this.balance - totalBalance);
    }

    function killContract()
      onlyOwner
    {
        if(totalBalance == 0) {
            selfdestruct(owner);
        }
    }

    function updateOwner(address newOwner)
      onlyOwner 
    {
        owner = newOwner;
    }

    function () {}
}
