import { ethers, network, run } from "hardhat";

// USDC addresses
const USDC_ADDRESSES: Record<string, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;

  console.log("=".repeat(60));
  console.log("BaseSubscribe Deployment");
  console.log("=".repeat(60));
  console.log(`Network: ${networkName}`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("=".repeat(60));

  // Get USDC address for the network
  let usdcAddress: string;

  if (networkName === "hardhat" || networkName === "localhost") {
    // Deploy mock USDC for local testing
    console.log("\nDeploying MockUSDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log(`MockUSDC deployed at: ${usdcAddress}`);
  } else {
    usdcAddress = USDC_ADDRESSES[networkName];
    if (!usdcAddress) {
      throw new Error(`No USDC address configured for network: ${networkName}`);
    }
    console.log(`\nUsing USDC at: ${usdcAddress}`);
  }

  // Get platform wallet from env or use deployer
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  console.log(`Platform wallet: ${platformWallet}`);

  // Deploy BaseSubscribe
  console.log("\nDeploying BaseSubscribe...");
  const BaseSubscribe = await ethers.getContractFactory("BaseSubscribe");
  const baseSubscribe = await BaseSubscribe.deploy(usdcAddress, platformWallet);
  await baseSubscribe.waitForDeployment();

  const contractAddress = await baseSubscribe.getAddress();
  console.log(`BaseSubscribe deployed at: ${contractAddress}`);

  // Wait for confirmations on live networks
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    const deployTx = baseSubscribe.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5);
    }

    // Verify contract
    console.log("\nVerifying contract on BaseScan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [usdcAddress, platformWallet],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.log("Verification failed:", error.message);
      }
    }
  }

  // Create example plans on testnet
  if (networkName === "baseSepolia") {
    console.log("\nCreating example subscription plans...");

    const ONE_MONTH = 30 * 24 * 60 * 60;
    const ONE_WEEK = 7 * 24 * 60 * 60;

    // Example plans with USDC (6 decimals)
    const plans = [
      {
        price: ethers.parseUnits("5", 6),
        period: ONE_MONTH,
        name: "Basic Creator",
        description: "Access to basic content and community",
      },
      {
        price: ethers.parseUnits("15", 6),
        period: ONE_MONTH,
        name: "Premium Creator",
        description: "Full access to all content and exclusive perks",
      },
      {
        price: ethers.parseUnits("2", 6),
        period: ONE_WEEK,
        name: "Weekly Pass",
        description: "Weekly access pass for casual supporters",
      },
    ];

    for (const plan of plans) {
      const tx = await baseSubscribe.createPlan(
        plan.price,
        plan.period,
        plan.name,
        plan.description
      );
      await tx.wait();
      console.log(`Created plan: ${plan.name}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Summary");
  console.log("=".repeat(60));
  console.log(`Network:        ${networkName}`);
  console.log(`BaseSubscribe:  ${contractAddress}`);
  console.log(`USDC:           ${usdcAddress}`);
  console.log(`Platform:       ${platformWallet}`);
  console.log(`Platform Fee:   ${await baseSubscribe.platformFeeBps()} bps (2%)`);
  console.log(`Keeper Fee:     ${await baseSubscribe.keeperFeeBps()} bps (0.5%)`);
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: network.config.chainId,
    contracts: {
      BaseSubscribe: contractAddress,
      USDC: usdcAddress,
    },
    platformWallet,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment info (save this):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
