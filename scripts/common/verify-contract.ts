import hre from "hardhat";

export const verifyContract = async (
  contractAddress: string,
  constructorArgs: any[]
) => {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs,
  });
};
