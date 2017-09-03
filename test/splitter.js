const Splitter = artifacts.require("./Splitter.sol");

let BigNumber = web3.BigNumber;

contract("Splitter test: ", accounts => {
    let contract;
    let amountToSend = new BigNumber(web3.toWei(1, "ether")).plus(1);
    let account1SendAmount = amountToSend.dividedToIntegerBy(2);
    let account2SendAmount = amountToSend.minus(account1SendAmount);

    beforeEach(() => {
        return Splitter.new({from: accounts[0]})
        .then(instance => contract = instance);
    });

    it("Test split funds", () => {
        return contract.splitFunds(accounts[1], accounts[2], {from: accounts[3], value: amountToSend})
        .then(tx => contract.balances(accounts[1]))
        .then(balance => assert.isTrue(balance.equals(account1SendAmount), "Split funds balance mismatch"))
        .then(() => contract.balances(accounts[2]))
        .then(balance => assert.isTrue(balance.equals(account2SendAmount), "Split funds balance mismatch"))
        .then(() => contract.totalBalance())
        .then(totalBalance => assert.isTrue(amountToSend.equals(totalBalance), "Total balance not updated correctly"));
    });

    it("Test withdraw funds", () => {
        let account1Balance = web3.eth.getBalance(accounts[1]);
        let account2Balance = web3.eth.getBalance(accounts[2]);
        let account1WithdrawCost;
        let account2WithdrawCost;

        return contract.withdrawFunds({from: accounts[0]})
        .then(() => assert.isTrue(false, "Withdraw funds should have failed"), error => assert.isTrue(true))
        .then(() => contract.splitFunds(accounts[1], accounts[2], {from: accounts[3], value: amountToSend}))
        .then(() => contract.withdrawFunds({from: accounts[1], gasPrice: web3.eth.gasPrice}))
        .then(tx => account1WithdrawCost = tx.receipt.gasUsed * web3.eth.gasPrice)
        .then(() => contract.withdrawFunds({from: accounts[2], gasPrice: web3.eth.gasPrice}))
        .then(tx => account2WithdrawCost = tx.receipt.gasUsed * web3.eth.gasPrice)
        .then(() => contract.balances(accounts[1]))
        .then(balance => assert.equal(balance, "0", "Account 1 balance not 0 in contract"))
        .then(() => contract.balances(accounts[2]))
        .then(balance => assert.equal(balance, "0", "Account 1 balance not 0 in contract"))
        .then(() => contract.totalBalance())
        .then(totalBalance => assert.equal(totalBalance, "0", "Total balance not updated correctly"))
        .then(() => {
            let newBalance = web3.eth.getBalance(accounts[1]).toString();
            let expectedBalance = account1Balance.plus(account1SendAmount).minus(account1WithdrawCost).toString()
            assert.equal(newBalance, expectedBalance, "Account 1 balance not increased by correct amount")
        })
        .then(() => {
            let newBalance = web3.eth.getBalance(accounts[2]).toString();
            let expectedBalance = account2Balance.plus(account2SendAmount).minus(account2WithdrawCost).toString()
            assert.equal(newBalance, expectedBalance, "Account 2 balance not increased by correct amount")
        });
    });

    it("Test force send funds", () => {
        let account1StartBalance = web3.eth.getBalance(accounts[1]);

        return contract.splitFunds(accounts[1], accounts[2], {from: accounts[3], value: amountToSend})
        .then(() => contract.forceSendFunds(accounts[1], {from:accounts[4]}))
        .then(() => assert.isTrue(false, "Force send funds should have failed"), () => assert.isTrue(true))
        .then(() => contract.forceSendFunds(accounts[4], {from:accounts[0]}))
        .then(() => assert.isTrue(false, "Force send funds should have failed"), () => assert.isTrue(true))
        .then(() => contract.forceSendFunds(accounts[1], {from:accounts[0]}))
        .then(() => contract.totalBalance())
        .then(totalBalance => assert.isTrue(totalBalance.lessThan(amountToSend), "Total balance was not reduced"))
        .then(() => assert.isTrue(web3.eth.getBalance(accounts[1]).greaterThan(account1StartBalance), "Balance of account 1 did not increase"));
    });

    it("Test kill contract", () => {
        return contract.killContract({from:accounts[0]})
        .then(() => contract.balances(account[0]))
        .then(() => assert.isTrue(false, "Calling balances should have failed"), () => assert.isTrue(true))
    });
})
