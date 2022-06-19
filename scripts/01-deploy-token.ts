import hre, { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { verifyContract } from "./common/verify-contract";

const outputFilePath = `./deployments/${hre.network.name}.json`;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`>>>>>>>>>>>> Deployer: ${deployer.address} <<<<<<<<<<<<\n`);

  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));

  const Comp = await ethers.getContractFactory("Comp");
  const comp = await Comp.deploy(deployer.address);
  await comp.deployed();
  console.log("Comp deployed to:", comp.address);

  deployments.FNR = comp.address;
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));

  await comp.deployTransaction.wait(15);
  await verifyContract(comp.address, [deployer.address]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
