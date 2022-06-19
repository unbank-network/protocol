import hre, { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { toBn, numToWei } from "../utils/utils";
import { verifyContract } from "./common/verify-contract";

const outputFilePath = `./deployments/${hre.network.name}.json`;

// IR Model Params
const params = {
  blocksPerYear: "15017150",
  baseRate: "0",
  kink: "90",
  multiplierPreKink: "15",
  multiplierPostKink: "20",
  admin: "0xa2a1343d9981b2be9cce36dc0DdB479cBB298636",
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`>>>>>>>>>>>> Deployer: ${deployer.address} <<<<<<<<<<<<\n`);

  const deployments = JSON.parse(readFileSync(outputFilePath, "utf-8"));

  const jumpMultiplier = getJumpMultiplier(params.kink, params.multiplierPreKink, params.multiplierPostKink);

  const baseRateWei = numToWei(toBn(params.baseRate).div(100), 18);
  const kinkWei = numToWei(toBn(params.kink).div(100), 18);
  const multiplierWei = numToWei(toBn(params.multiplierPreKink).div(100), 18);
  const jumpMultiplierWei = numToWei(toBn(jumpMultiplier).div(100), 18);

  const JumpRateModelV3 = await ethers.getContractFactory("JumpRateModelV3");
  const jumpRateModelV3 = await JumpRateModelV3.deploy(
    params.blocksPerYear,
    baseRateWei,
    multiplierWei,
    jumpMultiplierWei,
    kinkWei,
    params.admin,
  );
  await jumpRateModelV3.deployed();

  console.log(`JumpRateModelV3 deployed to: ${jumpRateModelV3.address}.`);

  // save data
  if (!deployments.JumpRateModelV3) deployments.JumpRateModelV3 = {};

  deployments.JumpRateModelV3[
    `${params.baseRate}__${params.kink}__${params.multiplierPreKink}__${params.multiplierPostKink}`
  ] = jumpRateModelV3.address;
  writeFileSync(outputFilePath, JSON.stringify(deployments, null, 2));

  await jumpRateModelV3.deployTransaction.wait(15);
  await verifyContract(jumpRateModelV3.address, [
    params.blocksPerYear,
    baseRateWei,
    multiplierWei,
    jumpMultiplierWei,
    kinkWei,
    deployer.address,
  ]);
}

const getJumpMultiplier = (kink: string, multiplierPreKink: string, multiplierPostKink: string): string => {
  return toBn(multiplierPostKink)
    .minus(multiplierPreKink)
    .div(toBn(100).minus(kink))
    .times(100).toFixed();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});