import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { BaseSubscribe } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BaseSubscribe", function () {
  let baseSubscribe: BaseSubscribe;
  let mockUSDC: any;
  let owner: SignerWithAddress;
  let platformWallet: SignerWithAddress;
  let creator: SignerWithAddress;
  let subscriber: SignerWithAddress;
  let keeper: SignerWithAddress;

  const USDC_DECIMALS = 6;
  const ONE_USDC = ethers.parseUnits("1", USDC_DECIMALS);
  const TEN_USDC = ethers.parseUnits("10", USDC_DECIMALS);
  const HUNDRED_USDC = ethers.parseUnits("100", USDC_DECIMALS);
  const ONE_MONTH = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [owner, platformWallet, creator, subscriber, keeper] = await ethers.getSigners();

    // Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    // Deploy BaseSubscribe
    const BaseSubscribe = await ethers.getContractFactory("BaseSubscribe");
    baseSubscribe = await BaseSubscribe.deploy(
      await mockUSDC.getAddress(),
      platformWallet.address
    );

    // Mint USDC to subscriber
    await mockUSDC.mint(subscriber.address, HUNDRED_USDC);

    // Approve BaseSubscribe to spend subscriber's USDC
    await mockUSDC.connect(subscriber).approve(
      await baseSubscribe.getAddress(),
      ethers.MaxUint256
    );
  });

  describe("Plan Management", function () {
    it("should create a plan", async function () {
      const tx = await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Premium Plan",
        "Access to premium content"
      );

      await expect(tx)
        .to.emit(baseSubscribe, "PlanCreated")
        .withArgs(1, creator.address, TEN_USDC, ONE_MONTH);

      const plan = await baseSubscribe.getPlan(1);
      expect(plan.creator).to.equal(creator.address);
      expect(plan.price).to.equal(TEN_USDC);
      expect(plan.period).to.equal(ONE_MONTH);
      expect(plan.name).to.equal("Premium Plan");
      expect(plan.active).to.be.true;
    });

    it("should reject plan with zero price", async function () {
      await expect(
        baseSubscribe.connect(creator).createPlan(0, ONE_MONTH, "Free Plan", "")
      ).to.be.revertedWith("Price must be > 0");
    });

    it("should reject plan with period less than 1 day", async function () {
      await expect(
        baseSubscribe.connect(creator).createPlan(TEN_USDC, 3600, "Hourly", "")
      ).to.be.revertedWith("Period must be >= 1 day");
    });

    it("should update plan active status", async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Plan",
        ""
      );

      await baseSubscribe.connect(creator).updatePlan(1, false);
      const plan = await baseSubscribe.getPlan(1);
      expect(plan.active).to.be.false;
    });

    it("should reject update from non-creator", async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Plan",
        ""
      );

      await expect(
        baseSubscribe.connect(subscriber).updatePlan(1, false)
      ).to.be.revertedWith("Not plan creator");
    });
  });

  describe("Subscription", function () {
    beforeEach(async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Premium Plan",
        "Access to premium content"
      );
    });

    it("should subscribe to a plan", async function () {
      const tx = await baseSubscribe.connect(subscriber).subscribe(1);

      await expect(tx)
        .to.emit(baseSubscribe, "Subscribed")
        .withArgs(1, 1, subscriber.address);

      const sub = await baseSubscribe.getSubscription(1);
      expect(sub.subscriber).to.equal(subscriber.address);
      expect(sub.planId).to.equal(1);
      expect(sub.active).to.be.true;

      const plan = await baseSubscribe.getPlan(1);
      expect(plan.subscriberCount).to.equal(1);
    });

    it("should deduct payment on subscribe", async function () {
      const balanceBefore = await mockUSDC.balanceOf(subscriber.address);
      await baseSubscribe.connect(subscriber).subscribe(1);
      const balanceAfter = await mockUSDC.balanceOf(subscriber.address);

      expect(balanceBefore - balanceAfter).to.equal(TEN_USDC);
    });

    it("should distribute fees correctly on subscribe", async function () {
      // Platform fee: 2% = 0.2 USDC
      // Creator gets: 98% = 9.8 USDC
      const platformBalanceBefore = await mockUSDC.balanceOf(platformWallet.address);

      await baseSubscribe.connect(subscriber).subscribe(1);

      const platformBalanceAfter = await mockUSDC.balanceOf(platformWallet.address);
      const creatorBalance = await baseSubscribe.getCreatorBalance(creator.address);

      // Platform gets 2%
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(
        ethers.parseUnits("0.2", USDC_DECIMALS)
      );

      // Creator gets 98%
      expect(creatorBalance).to.equal(
        ethers.parseUnits("9.8", USDC_DECIMALS)
      );
    });

    it("should reject duplicate subscription", async function () {
      await baseSubscribe.connect(subscriber).subscribe(1);

      await expect(
        baseSubscribe.connect(subscriber).subscribe(1)
      ).to.be.revertedWith("Already subscribed to this plan");
    });

    it("should reject subscription to inactive plan", async function () {
      await baseSubscribe.connect(creator).updatePlan(1, false);

      await expect(
        baseSubscribe.connect(subscriber).subscribe(1)
      ).to.be.revertedWith("Plan not active");
    });
  });

  describe("Cancellation with Pro-rata Refund", function () {
    beforeEach(async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Premium Plan",
        ""
      );
      await baseSubscribe.connect(subscriber).subscribe(1);
    });

    it("should cancel subscription", async function () {
      const tx = await baseSubscribe.connect(subscriber).cancelSubscription(1);

      await expect(tx).to.emit(baseSubscribe, "SubscriptionCancelled");

      const sub = await baseSubscribe.getSubscription(1);
      expect(sub.active).to.be.false;

      const plan = await baseSubscribe.getPlan(1);
      expect(plan.subscriberCount).to.equal(0);
    });

    it("should calculate pro-rata refund correctly", async function () {
      // Advance time by 15 days (half the period)
      await time.increase(15 * 24 * 60 * 60);

      const balanceBefore = await mockUSDC.balanceOf(subscriber.address);
      await baseSubscribe.connect(subscriber).cancelSubscription(1);
      const balanceAfter = await mockUSDC.balanceOf(subscriber.address);

      // Should get approximately 50% refund (minus some for time passed)
      // Creator balance was 9.8 USDC, refund should be ~4.9 USDC
      const refund = balanceAfter - balanceBefore;
      expect(refund).to.be.closeTo(
        ethers.parseUnits("4.9", USDC_DECIMALS),
        ethers.parseUnits("0.1", USDC_DECIMALS) // Allow small variance
      );
    });

    it("should give no refund after period ends", async function () {
      await time.increase(ONE_MONTH + 1);

      const balanceBefore = await mockUSDC.balanceOf(subscriber.address);
      await baseSubscribe.connect(subscriber).cancelSubscription(1);
      const balanceAfter = await mockUSDC.balanceOf(subscriber.address);

      expect(balanceAfter).to.equal(balanceBefore);
    });

    it("should reject cancel from non-subscriber", async function () {
      await expect(
        baseSubscribe.connect(creator).cancelSubscription(1)
      ).to.be.revertedWith("Not subscriber");
    });
  });

  describe("Keeper Execution", function () {
    beforeEach(async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Premium Plan",
        ""
      );
      await baseSubscribe.connect(subscriber).subscribe(1);

      // Give subscriber more USDC for recurring payments
      await mockUSDC.mint(subscriber.address, HUNDRED_USDC);
    });

    it("should execute payment when due", async function () {
      // Advance to next payment
      await time.increase(ONE_MONTH);

      const tx = await baseSubscribe.connect(keeper).executeSubscription(1);

      await expect(tx)
        .to.emit(baseSubscribe, "PaymentExecuted")
        .withArgs(1, keeper.address, TEN_USDC);

      const sub = await baseSubscribe.getSubscription(1);
      expect(sub.active).to.be.true;
    });

    it("should distribute fees correctly including keeper", async function () {
      await time.increase(ONE_MONTH);

      const keeperBalanceBefore = await mockUSDC.balanceOf(keeper.address);
      const platformBalanceBefore = await mockUSDC.balanceOf(platformWallet.address);
      const creatorBalanceBefore = await baseSubscribe.getCreatorBalance(creator.address);

      await baseSubscribe.connect(keeper).executeSubscription(1);

      const keeperBalanceAfter = await mockUSDC.balanceOf(keeper.address);
      const platformBalanceAfter = await mockUSDC.balanceOf(platformWallet.address);
      const creatorBalanceAfter = await baseSubscribe.getCreatorBalance(creator.address);

      // Keeper gets 0.5% = 0.05 USDC
      expect(keeperBalanceAfter - keeperBalanceBefore).to.equal(
        ethers.parseUnits("0.05", USDC_DECIMALS)
      );

      // Platform gets 2% = 0.2 USDC
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(
        ethers.parseUnits("0.2", USDC_DECIMALS)
      );

      // Creator gets 97.5% = 9.75 USDC
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        ethers.parseUnits("9.75", USDC_DECIMALS)
      );
    });

    it("should reject execution when not due", async function () {
      await expect(
        baseSubscribe.connect(keeper).executeSubscription(1)
      ).to.be.revertedWith("Payment not due");
    });

    it("should return executable subscriptions", async function () {
      // Initially no subscriptions are due
      let executable = await baseSubscribe.getExecutableSubscriptions();
      expect(executable.length).to.equal(0);

      // Advance time
      await time.increase(ONE_MONTH);

      executable = await baseSubscribe.getExecutableSubscriptions();
      expect(executable.length).to.equal(1);
      expect(executable[0]).to.equal(1);
    });

    it("should batch execute subscriptions", async function () {
      // Create second subscriber
      const [, , , , , subscriber2] = await ethers.getSigners();
      await mockUSDC.mint(subscriber2.address, HUNDRED_USDC);
      await mockUSDC.connect(subscriber2).approve(
        await baseSubscribe.getAddress(),
        ethers.MaxUint256
      );
      await baseSubscribe.connect(subscriber2).subscribe(1);

      // Advance time
      await time.increase(ONE_MONTH);

      // Batch execute
      await baseSubscribe.connect(keeper).executeSubscriptions([1, 2]);

      const sub1 = await baseSubscribe.getSubscription(1);
      const sub2 = await baseSubscribe.getSubscription(2);

      // Both should have updated nextPayment
      expect(sub1.lastPayment).to.be.gt(sub1.startTime);
      expect(sub2.lastPayment).to.be.gt(sub2.startTime);
    });
  });

  describe("Creator Withdrawal", function () {
    beforeEach(async function () {
      await baseSubscribe.connect(creator).createPlan(
        TEN_USDC,
        ONE_MONTH,
        "Premium Plan",
        ""
      );
      await baseSubscribe.connect(subscriber).subscribe(1);
    });

    it("should withdraw creator earnings", async function () {
      const balance = await baseSubscribe.getCreatorBalance(creator.address);
      expect(balance).to.be.gt(0);

      const creatorBalanceBefore = await mockUSDC.balanceOf(creator.address);

      await baseSubscribe.connect(creator).withdrawCreatorEarnings();

      const creatorBalanceAfter = await mockUSDC.balanceOf(creator.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(balance);

      const newBalance = await baseSubscribe.getCreatorBalance(creator.address);
      expect(newBalance).to.equal(0);
    });

    it("should reject withdrawal with no balance", async function () {
      await baseSubscribe.connect(creator).withdrawCreatorEarnings();

      await expect(
        baseSubscribe.connect(creator).withdrawCreatorEarnings()
      ).to.be.revertedWith("No balance");
    });
  });

  describe("Admin Functions", function () {
    it("should update platform fee", async function () {
      await baseSubscribe.connect(owner).setPlatformFee(300);
      expect(await baseSubscribe.platformFeeBps()).to.equal(300);
    });

    it("should reject fee above max", async function () {
      await expect(
        baseSubscribe.connect(owner).setPlatformFee(1500)
      ).to.be.revertedWith("Fee too high");
    });

    it("should update keeper fee", async function () {
      await baseSubscribe.connect(owner).setKeeperFee(100);
      expect(await baseSubscribe.keeperFeeBps()).to.equal(100);
    });

    it("should transfer ownership", async function () {
      await baseSubscribe.connect(owner).transferOwnership(creator.address);
      expect(await baseSubscribe.owner()).to.equal(creator.address);
    });

    it("should reject admin functions from non-owner", async function () {
      await expect(
        baseSubscribe.connect(creator).setPlatformFee(300)
      ).to.be.revertedWith("Not owner");
    });
  });
});

// Mock USDC contract for testing
const MockUSDCArtifact = {
  abi: [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function decimals() external view returns (uint8)"
  ]
};
