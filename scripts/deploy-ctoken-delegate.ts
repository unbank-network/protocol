import hre, { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { verifyContract } from "./common/verify-contract";

const outputFilePath = `./deployments/${hre.network.name}.json`;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`>>>>>>>>>>>> Deployer: ${deployer.address} <<<<<<<<<<<<\n`);

  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));
  const CErc20Delegate = await ethers.getContractFactory("CErc20Delegate");
  const cErc20Delegate = await CErc20Delegate.deploy();
  await cErc20Delegate.deployed();
  console.log("CErc20Delegate deployed to:", cErc20Delegate.address);

  if (!deployments.CErc20Delegates) deployments.CErc20Delegates = [];
  deployments.CErc20Delegates.push(cErc20Delegate.address);
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));

  await cErc20Delegate.deployTransaction.wait(15);
  await verifyContract(cErc20Delegate.address, []);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
